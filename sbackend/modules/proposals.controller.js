const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const db = require('_helpers/db');

// Routes
router.get('/', authorize(), getAll);
router.post('/', authorize(), insert);
// router.post('/update', authorize(), update);

module.exports = router;

async function getAll(req, res, next) {
  try {
    // const results = await db.Proposal.findAll({
    //   include: [
    //     {model: db.ProposalContent}
    //   ]
    // })
    const results = await db.Proposal.findAll({
      include: [
        {
          model: db.Grant,
          as: 'crt'
        },
        {
          model: db.Grant,
          as: 'acpt'
        },
        {
          model: db.ProposalContent
        }
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
      where: {
        acpt: {
          [Op.ne]: null
        }
      }
    })
    res.json(results)
  } catch (error) {
    console.log("error====>", error)
  }

}

async function update(req, res, next) {
  grantsService.update(req.body, req.user.id).then(() => {
    res.json({})
  }).catch(next);
}

async function insert(req, res, next) {
  console.log('insertBody: ', req.body);
  res.json({})
}
// `
//       SELECT * FROM proposals AS ps
//       LEFT JOIN grants AS crt ON ps.creator = crt.slack_id
//       LEFT JOIN grants AS apt ON ps.acceptor = apt.slack_id
//       LEFT JOIN proposalcontents AS pc ON ps.id = pc.proposalId`