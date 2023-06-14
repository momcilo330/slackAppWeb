const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      slack_id: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.BOOLEAN},
      by_whom: { type: DataTypes.STRING, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.STRING, allowNull: false },
      admin: { type: DataTypes.BOOLEAN, defaultValue: false},
      owner: { type: DataTypes.BOOLEAN, defaultValue: false}
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: true, 
    };

    return sequelize.define('grant', attributes, options);
}
// ALTER TABLE `grants` ADD `name` VARCHAR(255) NOT NULL AFTER `by_whom`, ADD `title` VARCHAR(255) NOT NULL AFTER `name`, ADD `image` VARCHAR(255) NOT NULL AFTER `title`, ADD `admin` BOOLEAN NULL DEFAULT FALSE AFTER `image`, ADD `owner` BOOLEAN NOT NULL DEFAULT FALSE AFTER `admin`;