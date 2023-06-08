const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      role: { type: DataTypes.STRING, allowNull: false },
      tasks: { type: DataTypes.STRING, allowNull: false },
      hours: { type: DataTypes.FLOAT, allowNull: false },
    };

    const options = {
        timestamps: false, 
    };

    return sequelize.define('proposalcontent', attributes, options);
}