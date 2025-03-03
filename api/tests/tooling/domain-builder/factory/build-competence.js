const faker = require('faker');

const Competence = require('../../../../lib/domain/models/Competence');
const buildArea = require('./build-area');

module.exports = function buildCompetence({
  id = faker.random.uuid(),
  // attributes
  name = faker.random.word(),
  index = `${faker.random.number()}.${faker.random.number()}`,
  courseId = faker.random.uuid(),
  description = faker.lorem.sentence(),
  // relationships
  area = buildArea(),
  skills = [],
} = {}) {

  return new Competence({
    id,
    // attributes
    name,
    index,
    courseId,
    description,
    // relationships
    area,
    skills,
  });
};
