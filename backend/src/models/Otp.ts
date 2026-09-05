import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IOtp extends Document {
  email: string;
  otp: string; // hashed
  name: string;
  password: string; // hashed (pre-hashed from registration)
  expiresAt: Date;
  createdAt: Date;
  compareOtp(candidateOtp: string): Promise<boolean>;
}

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — MongoDB auto-deletes when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the OTP before saving
otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare OTP method
otpSchema.methods.compareOtp = async function (
  candidateOtp: string
): Promise<boolean> {
  return bcrypt.compare(candidateOtp, this.otp);
};

const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
