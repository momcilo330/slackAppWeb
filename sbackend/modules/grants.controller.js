const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const slack = require('_helpers/slack');
const grantsService = require('./grants.service');

// Routes
router.get('/', authorize(), getAll);
router.post('/update', authorize(), update);

module.exports = router;

async function getAll(req, res, next) {
  try {
    const slackUsers = await slack.client.users.list();
    grantsService.getAll()
      .then(grants => {
        let members = [];
        if(slackUsers && slackUsers.members) {
          slackUsers.members.forEach(user => {
            if(!user.deleted && !user.is_bot && user.is_email_confirmed && !user.is_restricted) {
              if(grants && grants.length) {
                grants.forEach(grant => {
                  if(user.id === grant.dataValues.slack_id) {
                    user.grant = grant.dataValues
                  }
                });
              }
              members.push(user);
            }
            
          });
        }
        res.json(members)
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