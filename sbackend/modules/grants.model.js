const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      slack_id: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.BOOLEAN},
      by_whom: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: true, 
    };

    return sequelize.define('grant', attributes, options);
}