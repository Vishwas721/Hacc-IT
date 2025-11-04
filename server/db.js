const { Sequelize } = require('sequelize');
const ReportModel = require('./models/Report');
const UserModel = require('./models/User');

console.log('🧩 Connecting to DB...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {} // no SSL for internal Render connection
});

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
    console.error('❌ Unable to synchronize the database:', error);
  }
};

module.exports = { sequelize, Report, User, connectAndSync };
