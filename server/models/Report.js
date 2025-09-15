'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, { foreignKey: { allowNull: false } });
      Report.belongsTo(models.Department, { foreignKey: { allowNull: true } });
    }
  }
  Report.init({
    description: { type: DataTypes.TEXT, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    // THE FIX IS ON THIS LINE: Changed 4236 to 4326
    location: { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Submitted' }, // We'll keep this for easy querying
    category: DataTypes.STRING,
    urgency_score: { type: DataTypes.INTEGER, defaultValue: 1 },
    upvote_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    // ADD THIS NEW COLUMN
    statusHistory: {
      type: DataTypes.JSONB, // A column that can store JSON data
      defaultValue: [],
    },
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};