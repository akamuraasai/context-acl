const { roles, resources } = require('../db');
const { getToken, getUserByToken } = require('./helpers');

const mapRoles = (userId) => {
  const defaultAcl = {
    read: false,
    write: false,
    delete: false,
  };

  const permissions = roles
    .filter(role => role.user === userId)
    .reduce((items, { operation, resource }) => ({
        ...items,
        [resource]: [...(items[resource] || []), operation],
      }),
      {});

  const myResources = resources
    .filter(({ owner }) => owner === userId)
    .map(({ name }) => {
      const [resource, id] = name.split('-');

      return {
        resource,
        id,
        owner: true,
        permissions: {},
      };
    });

  const allResources = Object.keys(permissions)
    .map(key => {
      const { name, owner } = resources.find(({ id }) => Number(key) === id);
      const [resource, id] = name.split('-');
      return {
        resource,
        id,
        owner: owner === userId,
        permissions: permissions[key].reduce((acl, item) => ({ ...acl, [item]: true }), defaultAcl)
      };
    });

  const acl = [...myResources, ...allResources];
  return acl;
};

const me = (req, res) => {
  const token = getToken(req);
  const { id: userId } = getUserByToken(token);
  return res.status(200).send(mapRoles(userId));
};

module.exports = me;
