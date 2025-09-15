// File: server/models/Department.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      // A Department can have many Users and Reports
      Department.hasMany(models.User);
      Department.hasMany(models.Report);
    }
  }
  Department.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, {
    sequelize,
    modelName: 'Department',
  });
  return Department;
};