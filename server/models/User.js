// File: server/models/User.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A User can have many Reports
      User.hasMany(models.Report);
      // A User can optionally belong to a Department
      User.belongsTo(models.Department, { foreignKey: { allowNull: true } });
    }
  }
  User.init({
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    role: { type: DataTypes.STRING, defaultValue: 'staff', allowNull: false },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};