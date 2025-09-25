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
     description: { type: DataTypes.TEXT, allowNull: false }, // This will store the English text
  originalDescription: { type: DataTypes.TEXT, allowNull: true }, // This will store the original text
  imageUrl: { type: DataTypes.STRING, allowNull: false },
    // THE FIX IS ON THIS LINE: Changed 4236 to 4326
    location: { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: false },
    // In server/models/Report.js, inside Report.init({...})
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'Submitted',
        // 1. Add 'Rejected' to the list of valid statuses
        validate: {
            isIn: [['Submitted', 'Pending Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']]
        }
    },
    // 2. Add a new field to store the reason for rejection
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    priority: { // <-- ADD THIS FIELD
    type: DataTypes.STRING,
    defaultValue: 'Medium',
  }, // We'll keep this for easy querying
    isAiVerified: { // <-- ADD THIS FIELD
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
    category: DataTypes.STRING,
    urgency_score: { type: DataTypes.INTEGER, defaultValue: 1 },
      slaDeadline: { // <-- ADD THIS FIELD
    type: DataTypes.DATE,
    allowNull: true,
  },
    upvote_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    // ADD THIS NEW COLUMN
    statusHistory: {
      type: DataTypes.JSONB, // A column that can store JSON data
      defaultValue: [],
    },
        resolvedNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resolvedImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};