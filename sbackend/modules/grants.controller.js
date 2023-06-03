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

module.exports = router;

async function getAll(req, res, next) {
  const slackUsers = await slack.client.users.list();
  console.log('slackUsers======>', slackUsers)
  grantsService.getAll()
      .then(grants => res.json(grants))
      .catch(next);
}