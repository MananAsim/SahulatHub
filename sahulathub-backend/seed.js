require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');

const connectDB = require('./config/db');

const seedData = async () => {
    await connectDB();

    console.log('🌱 Seeding database...\n');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing users and tasks');

    // ─── Pre-hash passwords ────────────────────────────────────────────────────
    // We hash explicitly so insertMany() (which skips pre-save hooks) still
    // produces valid bcrypt hashes that matchPassword() can compare against.
    const SALT_ROUNDS = 10;
    const hash = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

    const [
        passClient1,
        passClient2,
        passWorker1,
        passWorker2,
        passAdmin,
    ] = await Promise.all([
        hash('password123'),
        hash('password123'),
        hash('password123'),
        hash('password123'),
        hash('admin2024'),
    ]);

    // ─── Seed Users ──────────────────────────────────────────────────────────────
    // Use insertMany with pre-hashed passwords to bypass the mongoose pre-save
    // hook (which would double-hash). All login flows use bcrypt.compare().
    const users = await User.insertMany([
        // Clients (email + password)
        {
            name: 'Ahmed Khan',
            email: 'ahmed@example.com',
            password: passClient1,
            role: 'client',
            rating: 4.2,
            location: { lat: 33.6844, lng: 73.0479 }, // Islamabad
            skills: [],
            availability: true,
        },
        {
            name: 'Fatima Malik',
            email: 'fatima@example.com',
            password: passClient2,
            role: 'client',
            rating: 3.8,
            location: { lat: 31.5497, lng: 74.3436 }, // Lahore
            skills: [],
            availability: true,
        },
        // Workers (phone + password)
        {
            name: 'Bilal Raza',
            phone: '+923001112222',
            password: passWorker1,
            role: 'worker',
            rating: 4.7,
            location: { lat: 33.7294, lng: 73.0931 }, // Rawalpindi near Islamabad
            skills: ['plumbing', 'repair', 'installation'],
            availability: true,
        },
        {
            name: 'Sara Iqbal',
            phone: '+923003334444',
            password: passWorker2,
            role: 'worker',
            rating: 4.1,
            location: { lat: 33.6204, lng: 72.974 }, // Rawalpindi
            skills: ['cleaning', 'housekeeping', 'cooking'],
            availability: true,
        },
        // Admin (email + password)
        {
            name: 'Super Admin',
            email: 'admin@sahulathub.com',
            password: passAdmin,
            role: 'admin',
            rating: 5,
            location: { lat: 33.6844, lng: 73.0479 },
            skills: ['management'],
            availability: true,
        },
    ]);

    const [client1, client2, worker1, worker2, admin] = users;

    console.log('\n👤 Users created:');
    users.forEach((u) =>
        console.log(`   [${u.role.toUpperCase()}] ${u.name} — ${u.email || u.phone}`)
    );

    // ─── Seed Tasks ──────────────────────────────────────────────────────────────
    const tasks = await Task.insertMany([
        {
            title: 'Fix kitchen pipe leak',
            description: 'The kitchen sink pipe is leaking and needs immediate repair.',
            category: 'Plumbing',
            urgency: 'high',
            location: { lat: 33.6844, lng: 73.0479 },
            radius: 10,
            status: 'open',
            client_id: client1._id,
        },
        {
            title: 'House deep cleaning',
            description: 'Need a thorough cleaning of a 2-bedroom apartment before moving in.',
            category: 'Cleaning',
            urgency: 'medium',
            location: { lat: 31.5497, lng: 74.3436 },
            radius: 5,
            status: 'open',
            client_id: client2._id,
        },
        {
            title: 'AC installation and setup',
            description: 'Install a 1.5 ton split AC in the living room.',
            category: 'Electrical',
            urgency: 'low',
            location: { lat: 33.6844, lng: 73.0479 },
            radius: 15,
            status: 'assigned',
            client_id: client1._id,
            assigned_worker_id: worker1._id,
        },
        {
            title: 'Deep kitchen cleaning',
            description: 'Full kitchen deep clean including appliances and cupboards.',
            category: 'Cleaning',
            urgency: 'medium',
            location: { lat: 33.7294, lng: 73.0931 },
            radius: 8,
            status: 'completed',
            client_id: client2._id,
            assigned_worker_id: worker1._id,
        },
    ]);

    console.log('\n📋 Tasks created:');
    tasks.forEach((t) =>
        console.log(`   [${t.status.toUpperCase()}] ${t.title} — ${t.category}`)
    );

    console.log('\n✅ Seed complete!\n');
    console.log('─────────────────────────────────────────────');
    console.log('📌 Test Credentials:');
    console.log('   [CLIENT]  ahmed@example.com    / password123  (email + password)');
    console.log('   [CLIENT]  fatima@example.com   / password123  (email + password)');
    console.log('   [WORKER]  +923001112222         / password123  (phone + password)');
    console.log('   [WORKER]  +923003334444         / password123  (phone + password)');
    console.log('   [ADMIN]   admin@sahulathub.com  / admin2024    (email + password)');
    console.log('─────────────────────────────────────────────\n');

    process.exit(0);
};

seedData().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
