const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const db = require('_helpers/db');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
// Routes
router.get('/', authorize(), getAll);
router.get('/pagedata', authorize(), pagedata);
router.get('/hoursData', authorize(), hoursData);
router.post('/', authorize(), insert);
// router.post('/update', authorize(), update);

module.exports = router;

async function getAll(req, res, next) {
  try {
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
        '$acpt.id$': {
          [Op.ne]: null
        }
      }
    })
    res.json(results)
  } catch (error) {
    console.log("error====>", error)
  }
}

async function pagedata(req, res, next) {
  let orders = ['createdAt', 'DESC'];
  let sortBy = JSON.parse(req.query.sortBy);
  
  if(sortBy && sortBy.length) {
    if(sortBy[0].desc) 
        orders[1] = 'DESC'
      else
        orders[1] = 'ASC'

    // if(sortBy[0].id == "crt") {
    //   orders[0] = 'createAt';
    // } else if(sortBy[0].id == "acpt") {
    //   orders[0] = 'createAt';
    // }
      //
      switch (sortBy[0].id) {
        case "status":
          orders[0] = 'status';
          break;
        case "createAt":
          orders[0] = 'createAt';
          break;
        case "updatedAt":
          orders[0] = 'updatedAt';
          break;
        case "name":
          orders[0] = 'name';
          break;
      }

  }
  
  try {
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
      // where: {
      //   '$acpt.id$': {
      //     [Op.ne]: null
      //   }
      // },
      where: {
        'name': {
          [Op.substring]: req.query.filter
        }
      },
      order: [
        orders,
      ],
      
      offset: Number(req.query.offset), 
      limit: Number(req.query.limit),
      // filter, sortBy
    })
    const count = await db.Proposal.count({
      where: {
        'name': {
          [Op.substring]: req.query.filter
        }
      }
    });
    res.json({results:results, count: count})
  } catch (error) {
    console.log("error====>", error)
  }
}
async function hoursData(req, res, next) {
  console.log('qqqq====>', req.query)
  let orders = ['hours', 'DESC'];
  let sortBy = JSON.parse(req.query.sortBy);
  
  if(sortBy && sortBy.length) {
    orders[0] = sortBy[0].id;
    if(sortBy[0].desc) 
        orders[1] = 'DESC'
      else
        orders[1] = 'ASC'
  }
  
  try {
    const results = await db.ProposalContent.findAll({
      where: {
        'role': {
          [Op.substring]: req.query.filter
        }
      },
      order: [
        orders,
      ],
      
      offset: Number(req.query.offset), 
      limit: Number(req.query.limit),
      // filter, sortBy
    })
    const count = await db.ProposalContent.count({
      where: {
        'role': {
          [Op.substring]: req.query.filter
        }
      }
    });
    res.json({results:results, count: count})
  } catch (error) {
    console.log("hoursDataError====>", error)
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