const { expect, databaseBuilder, domainBuilder, sinon } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const SkillDataObject = require('../../../../lib/infrastructure/datasources/airtable/objects/Skill');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | Target-profile', () => {

  describe('#get', () => {

    let targetProfile;
    let targetProfileFirstSkill;
    let skillAssociatedToTargetProfile;

    beforeEach(async () => {

      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      targetProfileFirstSkill = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId: 2 });
      await databaseBuilder.commit();

      skillAssociatedToTargetProfile = new SkillDataObject({ id: targetProfileFirstSkill.skillId, name: '@Acquis2' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', () => {
      // when
      const promise = targetProfileRepository.get(targetProfile.id);

      // then
      return promise.then((foundTargetProfile) => {
        expect(skillDatasource.findByRecordIds).to.have.been.calledWith([targetProfileFirstSkill.skillId]);

        expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);

        expect(foundTargetProfile.skills).to.be.an('array');
        expect(foundTargetProfile.skills.length).to.equal(1);
        expect(foundTargetProfile.skills[0]).to.be.an.instanceOf(Skill);
        expect(foundTargetProfile.skills[0].id).to.equal(skillAssociatedToTargetProfile.id);
        expect(foundTargetProfile.skills[0].name).to.equal(skillAssociatedToTargetProfile.name);

        expect(foundTargetProfile.sharedWithOrganizationIds).to.be.an('array');
        expect(foundTargetProfile.sharedWithOrganizationIds.length).to.equal(1);
        expect(foundTargetProfile.sharedWithOrganizationIds[0]).to.equal(2);
      });
    });
  });

  describe('#findPublicTargetProfiles', () => {

    let publicTargetProfile = domainBuilder.buildTargetProfile({ isPublic: true });
    let privateTargetProfile = domainBuilder.buildTargetProfile({ isPublic: false, });
    let publicProfileSkillAssociation;
    let targetProfileSkill;

    beforeEach(async () => {
      publicTargetProfile = databaseBuilder.factory.buildTargetProfile(publicTargetProfile);
      publicProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: publicTargetProfile.id });
      privateTargetProfile = databaseBuilder.factory.buildTargetProfile(privateTargetProfile);

      await databaseBuilder.commit();

      targetProfileSkill = new SkillDataObject({ id: publicProfileSkillAssociation.skillId, name: '@Acquis1' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    it('should return all public target profiles', () => {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((targetProfiles) => {
        expect(targetProfiles).to.have.lengthOf(1);
        expect(targetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(targetProfiles[0].isPublic).to.be.true;
      });
    });

    it('should contain skills linked to every target profiles', function() {
      // when
      const promise = targetProfileRepository.findPublicTargetProfiles();

      // then
      return promise.then((publicTargetProfiles) => {
        const targetProfileSkills = publicTargetProfiles[0].skills;
        expect(targetProfileSkills).to.be.an('array');
        expect(targetProfileSkills.length).to.equal(1);

        const skill = targetProfileSkills[0];
        expect(skill).to.be.an.instanceOf(Skill);
        expect(skill.id).to.equal(targetProfileSkill.id);
        expect(skill.name).to.equal(targetProfileSkill.name);
      });
    });
  });

  describe('#findTargetProfileByOrganizationId', () => {

    let theRequestedOrganization = domainBuilder.buildOrganization();
    let anotherOrganization = domainBuilder.buildOrganization();
    let requestedOrganizationTargetProfile = domainBuilder.buildTargetProfile({
      organizationId: theRequestedOrganization.id
    });
    let anotherOrganizationTargetProfile = domainBuilder.buildTargetProfile({
      organizationId: anotherOrganization.id
    });
    let targetProfileSkillAssociation;
    let targetProfileSkill;

    beforeEach(async () => {
      theRequestedOrganization = databaseBuilder.factory.buildOrganization(theRequestedOrganization);
      anotherOrganization = databaseBuilder.factory.buildOrganization(anotherOrganization);

      requestedOrganizationTargetProfile = databaseBuilder.factory.buildTargetProfile(requestedOrganizationTargetProfile);
      targetProfileSkillAssociation = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: requestedOrganizationTargetProfile.id });

      anotherOrganizationTargetProfile = databaseBuilder.factory.buildTargetProfile(anotherOrganizationTargetProfile);

      await databaseBuilder.commit();

      targetProfileSkill = new SkillDataObject({ id: targetProfileSkillAssociation.skillId, name: '@Acquis2' });
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([targetProfileSkill]);
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return an Array', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(theRequestedOrganization.id);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles).to.be.an('array');
      });
    });

    it('should return target profiles linked to the organization', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(theRequestedOrganization.id);

      // then
      return promise.then((foundTargetProfiles) => {
        expect(foundTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
        expect(foundTargetProfiles).to.have.lengthOf(1);
        expect(foundTargetProfiles[0].organizationId).to.equal(theRequestedOrganization.id);
      });
    });

    it('should contain skills linked to every target profiles', () => {
      // when
      const promise = targetProfileRepository.findTargetProfilesOwnedByOrganizationId(theRequestedOrganization.id);

      // then
      return promise.then((targetProfiles) => {
        const targetProfileSkills = targetProfiles[0].skills;
        expect(targetProfileSkills).to.be.an('array');
        expect(targetProfileSkills.length).to.equal(1);

        const skill = targetProfileSkills[0];
        expect(skill).to.be.an.instanceOf(Skill);
        expect(skill.id).to.equal(targetProfileSkill.id);
        expect(skill.name).to.equal(targetProfileSkill.name);
      });
    });
  });

  describe('#getByCampaignId', () => {
    let campaignId, targetProfileId;

    beforeEach(async () => {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
      const { skillId } = databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });
      const skillAssociatedToTargetProfile = new SkillDataObject({ id: skillId, name: '@Acquis2' });
      databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildCampaign();
      sinon.stub(skillDatasource, 'findByRecordIds').resolves([skillAssociatedToTargetProfile]);

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the target profile matching the campaign id', async () => {
      // when
      const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
      // then
      expect(targetProfile.id).to.equal(targetProfileId);
    });
  });
});
