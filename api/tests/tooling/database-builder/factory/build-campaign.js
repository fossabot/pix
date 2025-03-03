const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildTargetProfile = require('./build-target-profile');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildCampaign({
  id,
  name = faker.company.companyName(),
  code = faker.random.alphaNumeric(9),
  title = faker.random.word(),
  idPixLabel = faker.random.word(),
  customLandingPageText = faker.lorem.text(),
  createdAt = faker.date.recent(),
  organizationId,
  creatorId,
  targetProfileId,
} = {}) {

  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;
  creatorId = _.isNil(creatorId) ? buildUser().id : creatorId;
  targetProfileId = _.isNil(targetProfileId) ? buildTargetProfile({ organizationId }).id : targetProfileId;

  const values = {
    id,
    name,
    code,
    title,
    createdAt,
    idPixLabel,
    customLandingPageText,
    organizationId,
    creatorId,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'campaigns',
    values,
  });
};
