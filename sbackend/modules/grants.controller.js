const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const slack = require('_helpers/slack');
const grantsService = require('./grants.service');
const cron = require('node-cron');
// Routes
router.get('/', authorize(), getAll);
router.post('/update', authorize(), update);

module.exports = router;

async function getAll(req, res, next) {
  try {
    grantsService.getAll()
      .then(grants => {
        res.json(grants)
      })
      .catch(next);
    }
    catch (error) {
      console.log("error====>", error)
    }
}

async function update(req, res, next) {
  grantsService.update(req.body, req.user.id).then(() => {
    res.json({})
  }).catch(next);
}

// syncing everyday.
cron.schedule('* * 24 * *', async () => {
  console.log('=====Syncing slack users to DB everyday=====');
  syncWithSlack();
});

// start syncing when app start
(async function() {      
  console.log("----syncing slack users to DB----------")
  syncWithSlack();  
  
})();

async function syncWithSlack() {
  try {
    const sUsers = await slack.client.users.list();
    const slackUsers = sUsers.members.filter(user => {
      return !user.deleted && !user.is_bot && user.is_email_confirmed && !user.is_restricted
    });

    const grants = await grantsService.getAll();

    for(let i = 0; i < grants.length; i++) {
      const grant = grants[i];
      let isExist = false;
      for(let k = 0; k < slackUsers.length; k++) {
        const slackUser = slackUsers[k];
        if(grant.dataValues.slack_id == slackUser.id) {
          isExist = true;
          // different something
          if(grant.dataValues.name != slackUser.real_name ||
            grant.dataValues.admin != slackUser.is_admin ||
            grant.dataValues.owner != slackUser.is_owner ||
            grant.dataValues.image != slackUser.profile.image_32 ||
            grant.dataValues.title != slackUser.profile.title) {
              await db.Grant.update({
                name: slackUser.real_name,
                admin: slackUser.is_admin,
                owner: slackUser.is_owner,
                image: slackUser.profile.image_32,
                title: slackUser.profile.title,
              }, {
                where: {
                  id: grant.dataValues.id
                }
              });
            }
        }
      }
      if(!isExist) {
        await db.Grant.destroy({
          where: {
            id: grant.dataValues.id 
          }
      })
      }
    }

    for(let m = 0; m < slackUsers.length; m++) {
      const slackUser = slackUsers[m];
      let isExist = false;
      for(let h = 0; h < grants.length; h++) {
        const grant = grants[h];
        if(slackUser.id == grant.dataValues.slack_id) {
          isExist = true;
        }
      }
      if(!isExist) {
        await db.Grant.create({
          slack_id: slackUser.id,
          name: slackUser.real_name,
          admin: slackUser.is_admin,
          owner: slackUser.is_owner,
          image: slackUser.profile.image_32,
          title: slackUser.profile.title,
        });
      }
    }
  } catch (error) {
    console.log("Error in SyncWithSlack====>", error)
  }
  
}