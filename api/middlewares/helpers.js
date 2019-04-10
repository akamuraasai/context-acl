const { users } = require('../db');

exports.getToken = ({ headers = {} }) => headers.authorization;

exports.getUserByToken = token => {
  const user = users.find(user => user.token === token) || {};
  return user;
};
