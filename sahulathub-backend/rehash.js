require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

/**
 * rehash.js — One-time migration script
 *
 * Scans every document in the `users` collection.
 * If a password field is NOT already a bcrypt hash (i.e., does not start with
 * "$2a$" or "$2b$"), it re-hashes it in place.
 *
 * Run once:  node rehash.js
 * Safe to re-run — it skips already-hashed passwords.
 */

const BCRYPT_PREFIX = /^\$2[ab]\$/;
const SALT_ROUNDS = 10;

const rehash = async () => {
    await connectDB();

    // Access raw collection to read the password field (it's `select: false` in the model)
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    const users = await collection.find({}).toArray();
    console.log(`\n🔍 Found ${users.length} user(s) in the collection.\n`);

    let alreadyHashed = 0;
    let rehashed = 0;
    let errors = 0;

    for (const user of users) {
        const pw = user.password;

        if (!pw) {
            console.warn(`  ⚠️  Skipping ${user.name || user._id} — no password field found.`);
            continue;
        }

        if (BCRYPT_PREFIX.test(pw)) {
            alreadyHashed++;
            continue; // already a valid bcrypt hash
        }

        // Plain-text (or otherwise non-bcrypt) password — rehash it
        try {
            const hashed = await bcrypt.hash(pw, SALT_ROUNDS);
            await collection.updateOne(
                { _id: user._id },
                { $set: { password: hashed } }
            );
            console.log(`  ✅ Rehashed: ${user.email || user.phone || user._id}`);
            rehashed++;
        } catch (err) {
            console.error(`  ❌ Failed for ${user._id}:`, err.message);
            errors++;
        }
    }

    console.log('\n─────────────────────────────────────────────');
    console.log(`✅ Already hashed  : ${alreadyHashed}`);
    console.log(`🔒 Rehashed        : ${rehashed}`);
    console.log(`❌ Errors          : ${errors}`);
    console.log('─────────────────────────────────────────────\n');

    process.exit(errors > 0 ? 1 : 0);
};

rehash().catch((err) => {
    console.error('❌ rehash.js failed:', err.message);
    process.exit(1);
});
