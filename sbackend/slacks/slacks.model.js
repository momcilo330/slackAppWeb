const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      slack_id: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.BOOLEAN},
      by_whom: { type: DataTypes.STRING, allowNull: false },
      updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false, 
    };

    return sequelize.define('grant', attributes, options);
}