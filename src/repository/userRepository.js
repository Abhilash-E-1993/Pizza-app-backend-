const User = require('../schema/UserSchema');

async function findUser(query = {}) {
  return User.findOne(query);
}

async function createUser(userData) {
  return User.create(userData);
}

module.exports = {
  findUser,
  createUser,
};
