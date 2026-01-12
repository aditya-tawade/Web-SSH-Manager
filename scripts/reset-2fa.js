#!/usr/bin/env node

/**
 * UnifiedSSH - 2FA Reset Script
 * 
 * Usage: node scripts/reset-2fa.js <username>
 * 
 * This script disables 2FA for a user who has lost access to their authenticator app.
 * Must be run from the server with access to the MongoDB database.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const UserSchema = new mongoose.Schema({
    username: String,
    totpSecret: String,
    totpEnabled: Boolean,
    recoveryCodes: [String],
});

async function resetUserTwoFactor(username) {
    if (!username) {
        console.error('❌ Usage: node scripts/reset-2fa.js <username>');
        process.exit(1);
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI not found in .env file');
        process.exit(1);
    }

    try {
        console.log('🔗 Connecting to database...');
        await mongoose.connect(mongoUri);

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            console.error(`❌ User "${username}" not found`);
            process.exit(1);
        }

        if (!user.totpEnabled) {
            console.log(`ℹ️  User "${username}" does not have 2FA enabled`);
            process.exit(0);
        }

        // Reset 2FA
        user.totpEnabled = false;
        user.totpSecret = null;
        user.recoveryCodes = [];
        await user.save();

        console.log(`✅ 2FA has been disabled for user "${username}"`);
        console.log('🔐 The user can now log in with just their password');
        console.log('💡 Recommend re-enabling 2FA after login for security');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

const username = process.argv[2];
resetUserTwoFactor(username);
