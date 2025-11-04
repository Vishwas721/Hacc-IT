// server/db.js
const { Sequelize, DataTypes } = require('sequelize');
const ReportModel = require('./models/Report');
const UserModel = require('./models/User');

console.log('🔍 DATABASE_URL (runtime):', process.env.DATABASE_URL || 'undefined');

const isRender = process.env.RENDER === 'true' || process.env.RENDER_INTERNAL_HOSTNAME;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: isRender
    ? {} // internal -> no SSL
    : {   // local / external -> need SSL
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
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
