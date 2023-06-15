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
  const grant =  await db.Grant.update({
      status: params.status,
      by_whom: by_whom,
    }, {
      where: {
        id: params.id
      }
    });

  return grant;
}