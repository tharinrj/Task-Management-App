import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Otp from '../models/Otp';
import { sendOtpEmail } from '../config/mailer';

const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate JWT token
 */
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined');
    throw new Error('An error occured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, role }, secret, {
    expiresIn,
  } as jwt.SignOptions);
};

/**
 * Generate a random 6-digit OTP
 */
const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * POST /api/auth/register
 * Step 1: Validate input, send OTP email, store pending registration
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
      return;
    }

    // Hash the password now so we can store it with the OTP record
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOtp();

    // Remove any existing OTP for this email
    await Otp.deleteMany({ email });

    // Store OTP + registration data
    await Otp.create({
      email,
      otp,
      name,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    // Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Step 2: Verify OTP, create user, return JWT
 */
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, otp } = req.body;

    // Find the OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired or does not exist. Please register again.',
      });
      return;
    }

    // Verify OTP
    const isValid = await otpRecord.compareOtp(otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      });
      return;
    }

    // Check if user was created in the meantime (race condition guard)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Otp.deleteMany({ email });
      res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
      return;
    }

    // Create the user with the pre-hashed password
    const user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
      role: 'user',
    });

    // Skip the password hashing in the pre-save hook since it's already hashed
    user.$locals.skipPasswordHash = true;
    await user.save();

    // Clean up OTP records
    await Otp.deleteMany({ email });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Resend OTP for a pending registration
 */
export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email } = req.body;

    // Find existing OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.',
      });
      return;
    }

    // Generate new OTP
    const otp = generateOtp();

    // Update the record with new OTP and reset expiry
    otpRecord.otp = otp;
    otpRecord.expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await otpRecord.save();

    // Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error('Failed to resend OTP email:', emailErr);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login user and return JWT
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
