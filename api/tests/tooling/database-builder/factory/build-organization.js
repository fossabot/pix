const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildOrganization = function buildOrganization({
  id = faker.random.number(),
  type = 'PRO',
  name = faker.company.companyName(),
  code = 'ABCD12',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  createdAt = faker.date.recent()
} = {}) {

  const values = { id, type, name, code, logoUrl, createdAt };

  databaseBuffer.pushInsertable({
    tableName: 'organizations',
    values,
  });

  return values;
};

module.exports = buildOrganization;
