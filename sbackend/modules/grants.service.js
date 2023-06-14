const db = require('_helpers/db');

module.exports = {
  getAll,
  update
};

async function getAll() {
  const grants = await db.Grant.findAll({
    order: [
      ['admin', 'DESC'],
      ['owner', 'DESC'],
      ['status', 'DESC'],
      ['name', 'ASC']
    ]
  });
  return grants;
}

async function update(params, by_whom) {
  const [grant, created] = await db.Grant.findOrCreate({
    where: { slack_id: params.slack_id },
    defaults: {
      slack_id: params.slack_id,
      status: params.status,
      by_whom: by_whom,
    }
  });
  if(!created) {
    await db.Grant.update({
      status: params.status,
      by_whom: by_whom,
    }, {
      where: {
        slack_id: params.slack_id
      }
    });
  }
  return;
}