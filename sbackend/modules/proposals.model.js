const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      slackId: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      creator: { type: DataTypes.STRING, allowNull: false },
      acceptor: { type: DataTypes.STRING, allowNull: false},
      status: { type: DataTypes.STRING }
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: true, 
    };

    return sequelize.define('proposal', attributes, options);
}