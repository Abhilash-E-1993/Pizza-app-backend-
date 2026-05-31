const User = require('../schema/userSchema');

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
