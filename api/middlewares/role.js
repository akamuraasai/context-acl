const { roles, resources } = require('../db');
const { getToken, getUserByToken } = require('./helpers');

const getResource = (req) => {
  const { method, path } = req;
  const [_, base, id] = path.split('/');
  const isList = method === 'GET' && id === undefined;
  const firstPart = isList ? 'menu' : base;
  const secondPart = isList ? base : id;
  const resourceName = `${firstPart}-${secondPart}`;
  const resource = resources.find(item => item.name === resourceName) || {};
  return resource;
};

const checkRole = (userId, resourceId) => {
  const permissions = roles
    .filter(role => role.user === userId && role.resource === resourceId)
    .map(({ operation }) => operation);

  const defaultAcl = {
    read: false,
    write: false,
    delete: false,
  };

  return permissions
    .reduce((acl, item) => ({ ...acl, [item]: true }), defaultAcl);
};

const role = (req, res, next) => {
  const token = getToken(req);
  const { id: userId } = getUserByToken(token);
  const { id: resourceId, owner } = getResource(req);
  const { read, write, delete: canDelete } = checkRole(userId, resourceId);

  if ((userId !== undefined && owner === userId)
    || (userId !== undefined && req.path === '/acl')
    || req.method === 'GET' && read
    || ['POST', 'PUT', 'PATCH'].includes(req.method) && write
    || req.method === 'DELETE' && canDelete
  ) {
    return next();
  }

  return res.status(401).send('Unauthorized');
};

module.exports = role;
