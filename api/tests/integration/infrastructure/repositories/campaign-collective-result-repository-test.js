const { expect, databaseBuilder, domainBuilder, airtableBuilder } = require('../../../test-helper');
const campaignCollectiveResultRepository = require('../../../../lib/infrastructure/repositories/campaign-collective-result-repository');
const CampaignCollectiveResult = require('../../../../lib/domain/models/CampaignCollectiveResult');
const cache = require('../../../../lib/infrastructure/caches/cache');
const _ = require('lodash');

function _createUserWithCampaignParticipation(userName, campaignId, sharedAt) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    isShared: true,
    sharedAt
  });

  return { userId, campaignParticipation };
}

describe('Integration | Repository | Service | Campaign collective result repository', () => {

  beforeEach(() => {
    const areas = [airtableBuilder.factory.buildArea()];
    const competences = [];
    const skills = [];

    _.each([
      { competence: { id: 'recCompetenceA', titre: 'Competence A', sousDomaine: '1.1' }, skillIds: ['recUrl1', 'recUrl2', 'recUrl3', 'recUrl4', 'recUrl5'] },
      { competence: { id: 'recCompetenceB', titre: 'Competence B', sousDomaine: '1.2' }, skillIds: ['recFile2', 'recFile3', 'recFile5', 'recText1'] },
      { competence: { id: 'recCompetenceC', titre: 'Competence C', sousDomaine: '1.3' }, skillIds: ['recMedia1', 'recMedia2'] },
      { competence: { id: 'recCompetenceD', titre: 'Competence D', sousDomaine: '2.1' }, skillIds: ['recAlgo1', 'recAlgo2'] },
      { competence: { id: 'recCompetenceE', titre: 'Competence E', sousDomaine: '2.2' }, skillIds: ['recBrowser1'] },

    ], ({ competence, skillIds }) => {
      competences.push(airtableBuilder.factory.buildCompetence(competence));

      _.each(skillIds, (skillId) => skills.push(
        airtableBuilder.factory.buildSkill({ id: skillId, 'compétenceViaTube': [competence.id] })
      ));
    });

    airtableBuilder
      .mockList({ tableName: 'Domaines' })
      .returns(areas)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Competences' })
      .returns(competences)
      .activate();

    airtableBuilder
      .mockList({ tableName: 'Acquis' })
      .returns(skills)
      .activate();
  });

  afterEach(async () => {
    await cache.flushAll();
    await airtableBuilder.cleanAll();
    await databaseBuilder.clean();
  });

  describe('#getCampaignCollectiveResults', () => {

    context('in a rich context close to reality', () => {

      let targetProfileId;
      let campaignId;

      let url1Id, url2Id, url3Id, // comp. A
        file2Id, file3Id, file5Id, text1Id, // comp. B
        media1Id, media2Id, // comp. C
        algo1Id, algo2Id; // comp. D

      let defaultCampaignCollectiveResult;

      beforeEach(async () => {

        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;

        // Competence A - nobody validated skills @url4 and @url5
        url1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl1' }).skillId;
        url2Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl2' }).skillId;
        url3Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl3' }).skillId;
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl4' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recUrl5' });

        // Competence B - all skills are validated by different people
        file2Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile2' }).skillId;
        file3Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile3' }).skillId;
        file5Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recFile5' }).skillId;
        text1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recText1' }).skillId;

        // Competence C - skill @media2 is validated by someone but is not part of campaign target profile
        media1Id = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recMedia1' }).skillId;
        media2Id = 'recMedia2';

        // Competence D - competence D is not covered by campaign target profile
        algo1Id = 'recAlgo1';
        algo2Id = 'recAlgo2';

        // Competence E - competence E is targeted by campaign but nobody validated its skills
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recBrowser1' });

        defaultCampaignCollectiveResult = Object.freeze(domainBuilder.buildCampaignCollectiveResult({
          id: campaignId,
          campaignCompetenceCollectiveResults: [
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceA',
              competenceName: 'Competence A',
              competenceIndex: '1.1',
              totalSkillsCount: 5,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceB',
              competenceName: 'Competence B',
              competenceIndex: '1.2',
              totalSkillsCount: 4,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceC',
              competenceName: 'Competence C',
              competenceIndex: '1.3',
              totalSkillsCount: 1,
            },
            {
              averageValidatedSkills: 0,
              campaignId,
              competenceId: 'recCompetenceE',
              competenceName: 'Competence E',
              competenceIndex: '2.2',
              totalSkillsCount: 1,
            }
          ],
        }
        ));
      });

      context('when there is no participant', () => {

        beforeEach(async () => {
          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(defaultCampaignCollectiveResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(defaultCampaignCollectiveResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there is a participant but she did not share its contribution', () => {

        beforeEach(async () => {

          const goliathId = databaseBuilder.factory.buildUser({ firstName: 'Goliath' }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: goliathId,
            isShared: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({ userId: goliathId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: new Date('2019-02-01') });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with default values for all competences', async () => {
          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(defaultCampaignCollectiveResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(defaultCampaignCollectiveResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there is a single participant who shared its contribution', () => {

        beforeEach(async () => {
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');
          const userWithCampaignParticipationFred = _createUserWithCampaignParticipation('Fred', campaignId, new Date());
          const fredId = userWithCampaignParticipationFred.userId;

          _.each([
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

          ], (knownledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knownledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should resolves a collective result synthesis with its results as collective’s ones', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignCompetenceCollectiveResults: [
              {
                averageValidatedSkills: 1,
                campaignId,
                competenceId: 'recCompetenceA',
                competenceName: 'Competence A',
                competenceIndex: '1.1',
                totalSkillsCount: 5,
              },
              {
                averageValidatedSkills: 4,
                campaignId,
                competenceId: 'recCompetenceB',
                competenceName: 'Competence B',
                competenceIndex: '1.2',
                totalSkillsCount: 4,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceId: 'recCompetenceC',
                competenceName: 'Competence C',
                competenceIndex: '1.3',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0,
                campaignId,
                competenceId: 'recCompetenceE',
                competenceName: 'Competence E',
                competenceIndex: '2.2',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedResult.campaignCompetenceCollectiveResults);
        });
      });

      context('when there are multiple participants who shared their participation', () => {

        beforeEach(async () => {

          const campaignParticipationShareDate = new Date('2019-03-01');
          const beforeBeforeCampaignParticipationShareDate = new Date('2019-01-01');
          const beforeCampaignParticipationShareDate = new Date('2019-02-01');
          const afterCampaignParticipationShareDate = new Date('2019-05-01');

          // Alice
          const userWithCampaignParticipationAlice = _createUserWithCampaignParticipation('Alice', campaignId, campaignParticipationShareDate);
          const aliceId = userWithCampaignParticipationAlice.userId;

          // Bob
          const userWithCampaignParticipationBob = _createUserWithCampaignParticipation('Bob', campaignId, campaignParticipationShareDate);
          const bobId = userWithCampaignParticipationBob.userId;

          // Charlie
          const userWithCampaignParticipationCharlie = _createUserWithCampaignParticipation('Charlie', campaignId, campaignParticipationShareDate);
          const charlieId = userWithCampaignParticipationCharlie.userId;

          // Dan (did not shared its campaign participation)
          const danId = databaseBuilder.factory.buildUser({ firstName: 'Dan' }).id;
          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: danId,
            isShared: false,
          });

          /* KNOWLEDGE ELEMENTS */

          _.each([
            // Alice
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: aliceId, competenceId: 'recCompetenceD', skillId: algo1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: aliceId, competenceId: 'recCompetenceD', skillId: algo2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            // Bob
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: bobId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', campaignId, createdAt: beforeBeforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', campaignId, createdAt: afterCampaignParticipationShareDate },
            { userId: bobId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: bobId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            // Charlie
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: charlieId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: charlieId, competenceId: 'recCompetenceC', skillId: media2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            // Dan
            { userId: danId, competenceId: 'recCompetenceA', skillId: url1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceA', skillId: url2Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceA', skillId: url3Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: danId, competenceId: 'recCompetenceB', skillId: file2Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: file3Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: file5Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: danId, competenceId: 'recCompetenceB', skillId: text1Id, status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },

            { userId: danId, competenceId: 'recCompetenceC', skillId: media1Id, status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
          ], (knownledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knownledgeElement);
          });

          await databaseBuilder.commit();
        });

        it('should return a correct aggregated synthesis of participants results', async () => {
          // given
          const expectedResult = {
            id: campaignId,
            campaignCompetenceCollectiveResults: [
              {
                averageValidatedSkills: 4 / 3,
                campaignId,
                competenceId: 'recCompetenceA',
                competenceName: 'Competence A',
                competenceIndex: '1.1',
                totalSkillsCount: 5,
              },
              {
                averageValidatedSkills: 5 / 3,
                campaignId,
                competenceId: 'recCompetenceB',
                competenceName: 'Competence B',
                competenceIndex: '1.2',
                totalSkillsCount: 4,
              },
              {
                averageValidatedSkills: 1 / 3,
                campaignId,
                competenceId: 'recCompetenceC',
                competenceName: 'Competence C',
                competenceIndex: '1.3',
                totalSkillsCount: 1,
              },
              {
                averageValidatedSkills: 0 / 3,
                campaignId,
                competenceId: 'recCompetenceE',
                competenceName: 'Competence E',
                competenceIndex: '2.2',
                totalSkillsCount: 1,
              }
            ],
          };

          // when
          const result = await campaignCollectiveResultRepository.getCampaignCollectiveResult(campaignId);

          // then
          expect(result).to.be.an.instanceof(CampaignCollectiveResult);
          expect(result.id).to.equal(expectedResult.id);
          expect(result.campaignCompetenceCollectiveResults).to.deep.include.ordered.members(expectedResult.campaignCompetenceCollectiveResults);
        });
      });

    });
  });
});
