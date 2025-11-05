'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const basename = path.basename(__filename);
const db = {};

console.log('🔍 DATABASE_URL (runtime):', process.env.DATABASE_URL || 'undefined');

// Decide SSL based on Render host
const dbUrl = process.env.DATABASE_URL;
let dialectOptions = {};
try {
  const parsed = new URL(dbUrl);
  const host = parsed.hostname || '';
  const isInternalHost = !host.includes('render.com');
  if (!isInternalHost) {
    dialectOptions = {
      ssl: { require: true, rejectUnauthorized: false },
    };
  }
  console.log('🔗 DB host:', host, '| internal:', isInternalHost, '| ssl:', Boolean(dialectOptions.ssl));
} catch (e) {
  console.log('ℹ️ Could not parse DATABASE_URL; proceeding without SSL config');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions,
});

// --- Load all models dynamically ---
fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  ))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// --- Apply associations ---
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});

// --- Export unified Sequelize instance ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
