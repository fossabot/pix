const buildUser = require('./build-user');
const buildPixRole = require('./build-pix-role');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

const buildUserPixRole = function buildUserPixRole({
  id,
  userId,
  pixRoleId,
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;
  pixRoleId = _.isNil(pixRoleId) ? buildPixRole().id : pixRoleId;

  return databaseBuffer.pushInsertable({
    tableName: 'users_pix_roles',
    values: {
      id,
      'user_id': userId,
      'pix_role_id': pixRoleId
    },
  });
};

module.exports = buildUserPixRole;
