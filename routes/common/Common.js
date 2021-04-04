const fs = require('fs');
const mongoose = require('mongoose');
const Item = require('../../models').item;
const User = require('../../models').user;

/**
 * Verifies if the user is authenticated, if so
 * the cb will be executed
 * 
 * @param {String} token the user's token
 * @param {Response} res the response object
 * @param {JSON} response the JSON file
 * @param {Function} cb the callback function
 */
const isAuthenticated = (token, res, response, cb) => {
  User.findOne({token: token}, (err, user) => {
    if(user) {
      cb(user)
    } else {
      response.code = 2;
      res.status(401).json(response);
    }
  })
}

/**
 * Reads the response.json file
 *
 * @param {Function} cb the callback function
 */
const readResponseFile = async cb => {
  const data = fs.readFileSync(process.env.RESPONSE_FILE, {
    encoding: 'utf-8',
  });
  const response = JSON.parse(data);
  cb(response);
};

const readResponse = {
  message: '',
  code: 0,
  data: null
}

/**
 * 
 * @param {*} id
 * @param {*} res
 * @param {*} response
 * @param {*} cb
 */
const findItem = (id, res, response, cb) => {
  const itemId = mongoose.Types.ObjectId(id);
  Item.findOne({ _id: itemId }, (err, item) => {
    if (err) {
      response.message = `${process.env.MSG_SERVER_ERROR} ${err}`;
      response.code = 2;
      res.status(500).json(response);
    } else {
      cb(item);
    }
  });
};

const objectId = id => mongoose.Types.ObjectId(id);

module.exports = {
  isAuthenticated: isAuthenticated,
  readResponseFile: readResponseFile,
  findItem: findItem,
  objectId: objectId,
  readResponse: readResponse
};
