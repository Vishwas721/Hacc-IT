// File: server/seed.js
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

// --- Configuration ---
// Make sure to change these default passwords on your first login!
const SUPER_ADMIN_PASS = 'superadmin123';
const MUNI_ADMIN_PASS = 'muniadmin123';

const createAdmins = async () => {
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Database connected. Syncing models...');
    await sequelize.sync();
    console.log('Models synced.');

    try {
        // --- Create Super Admin ---
        const superAdminHash = await bcrypt.hash(SUPER_ADMIN_PASS, 10);
        const [superAdmin, superCreated] = await User.findOrCreate({
            where: { username: 'superadmin' },
            defaults: {
                password: superAdminHash,
                role: 'super-admin'
            }
        });
        if (superCreated) {
            console.log(`✅ SUCCESS: Created super-admin with username 'superadmin' and password '${SUPER_ADMIN_PASS}'`);
        } else {
            console.log('INFO: super-admin account already exists.');
        }

        // --- Create Municipal Admin ---
        const muniAdminHash = await bcrypt.hash(MUNI_ADMIN_PASS, 10);
        const [muniAdmin, muniCreated] = await User.findOrCreate({
            where: { username: 'municipaladmin' },
            defaults: {
                password: muniAdminHash,
                role: 'municipal-admin'
            }
        });
        if (muniCreated) {
            console.log(`✅ SUCCESS: Created municipal-admin with username 'municipaladmin' and password '${MUNI_ADMIN_PASS}'`);
        } else {
            console.log('INFO: municipal-admin account already exists.');
        }

    } catch (error) {
        console.error('❌ ERROR: Failed to create admin accounts:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
};

createAdmins();