const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    console.log("DBInitialize called!")
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.isProduction ? config.database_production : config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { host: host, dialect: 'mysql', logging: false });
    db.sequelize = sequelize;
    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.Grant = require('../modules/grants.model')(sequelize);
    db.Proposal = require('../modules/proposals.model')(sequelize);
    db.ProposalContent = require('../modules/proposalcontent.model')(sequelize);
    // define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    db.Proposal.hasMany(db.ProposalContent, { onDelete: 'CASCADE' });
    db.ProposalContent.belongsTo(db.Proposal);

    db.Proposal.belongsTo(db.Grant, { as: "crt", foreignKey: 'creator', targetKey : 'slack_id' });
    db.Proposal.belongsTo(db.Grant, { as: "acpt", foreignKey: 'acceptor', targetKey : 'slack_id' });

    // sync all models with database
    await sequelize.sync();
}