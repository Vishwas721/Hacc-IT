const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT', 4326), // Critical for PostGIS
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Submitted', // e.g., Submitted, In Progress, Resolved
    },
    category: {
      type: DataTypes.STRING, // e.g., Pothole, Garbage
    },
    urgency_score: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    upvote_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Starts at 1 for the original reporter
    },
  });

  return Report;
};