const db = require('_helpers/db');

module.exports = {
  getAll
};

async function getAll() {
  const grants = await db.Grant.findAll();
  return grants;
}