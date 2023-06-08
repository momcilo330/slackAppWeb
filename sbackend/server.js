require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
//
app.use(express.static(__dirname + '/public'));
app.get('/test', (req, res) => {
  console.log("arrived!")
  res.send("hello@");
});
// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/grants', require('./modules/grants.controller'));
app.use('/slacks', require('./slacks/slacks.controller'));
app.use('/proposals', require('./modules/proposals.controller'));

// swagger docs route
// app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
// const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const port = 3000;
app.listen(port, () => console.log('Server listening on port ' + port));
