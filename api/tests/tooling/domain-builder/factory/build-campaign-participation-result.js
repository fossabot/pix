const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');

const faker = require('faker');

module.exports = function buildCampaignParticipation(
  {
    id = 1,
    isCompleted = faker.random.boolean(),
    totalSkillsCount = 10,
    testedSkillsCount = 8,
    validatedSkillsCount = 5,
    competenceResults = [],
  } = {}) {
  return new CampaignParticipationResult({
    id,
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    competenceResults,
  });
};
