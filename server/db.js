const { Sequelize } = require('sequelize');
const ReportModel = require('./models/Report');
const UserModel = require('./models/User');

let sequelize;

// Check if we have a DATABASE_URL (production/Render) or individual credentials (local)
if (process.env.DATABASE_URL) {
    // Production/Render environment
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Local environment
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
        }
    );
}

const Report = ReportModel(sequelize);
const User = UserModel(sequelize);

User.hasMany(Report);
Report.belongsTo(User);

const connectAndSync = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB connection established.');
        await sequelize.sync({ alter: true });
        console.log('✅ Models synchronized.');
    } catch (error) {
        console.error('❌ DB connection/sync error:', error);
    }
};

module.exports = {
    sequelize,
    Report,
    User,
    connectAndSync,
};