const jsonServer = require('json-server');
const path = require('path');
const { roles, me } = require('./middlewares');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(roles);
server.get('/acl', me)
server.use(router);

server.listen(8000, () => {
  console.log('JSON Server is running');
});
