// server/db.js
const { Sequelize, DataTypes } = require('sequelize');
const ReportModel = require('./models/Report');
const UserModel = require('./models/User');

console.log('🔍 DATABASE_URL (runtime):', process.env.DATABASE_URL || 'undefined');

// Decide SSL based on the DATABASE_URL host (internal vs external)
const dbUrl = process.env.DATABASE_URL;
let dialectOptions = {};
try {
  const parsed = new URL(dbUrl);
  const host = parsed.hostname || '';
  const isInternalHost = !host.includes('render.com');
  if (!isInternalHost) {
    dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  }
  console.log('🔗 DB host:', host, '| internal:', isInternalHost, '| ssl:', Boolean(dialectOptions.ssl));
} catch (e) {
  console.log('ℹ️ Could not parse DATABASE_URL; proceeding with no explicit SSL options');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions,
});


// Pass both sequelize instance and DataTypes to model factory functions
const Report = ReportModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

User.hasMany(Report);
Report.belongsTo(User);

async function connectAndSync() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
  } catch (err) {
    console.error('❌ Unable to connect or sync DB:');
    console.error(err.name, err.code, err.message);
  }
}

module.exports = { sequelize, Report, User, connectAndSync };
