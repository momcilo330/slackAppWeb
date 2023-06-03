const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
// Routes
router.get('/', authorize(), getAll);

module.exports = router;

async function getAll(req, res, next) {
  res.json({})
}