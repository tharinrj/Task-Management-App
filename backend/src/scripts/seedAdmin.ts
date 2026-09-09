import dotenv from 'dotenv';
dotenv.config();

import * as readline from 'readline';
import mongoose from 'mongoose';
import User from '../models/User';

// ── Helper: prompt for input via stdin ──────────
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Helper: prompt for password (hidden input) ─
function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Mute output after the question is printed
    const stdout = process.stdout;
    rl.question(question, (answer) => {
      rl.close();
      stdout.write('\n');
      resolve(answer.trim());
    });

    // Hide typed characters
    (rl as any)._writeToOutput = function (char: string) {
      if (char.includes(question)) {
        stdout.write(question);
      } else {
        stdout.write('*');
      }
    };
  });
}

const seedAdmin = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    console.log('╔══════════════════════════════════════╗');
    console.log('║           Admin Seed Script          ║');
    console.log('╚══════════════════════════════════════╝');
    console.log();

    // Collect admin details interactively
    const adminName = await prompt('  Admin name  : ');
    const adminEmail = await prompt('  Admin email : ');
    const adminPassword = await promptPassword('  Admin password: ');

    if (!adminName || !adminEmail || !adminPassword) {
      console.error('\nAll fields (name, email, password) are required.');
      process.exit(1);
    }

    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('\n⚠  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('\n✔  Admin user created successfully:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedAdmin();
