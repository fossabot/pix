const { expect, sinon } = require('../../../test-helper');

const faker = require('faker');

const profileService = require('../../../../lib/domain/services/profile-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');

describe('Unit | Service | Profil User Service', function() {

  describe('#getUser', () => {

    it('should exist', () => {
      expect(profileService.getByUserId).to.exist;
    });

    let fakeUserRecord;
    let fakeCompetenceRecords;
    let fakeAreaRecords;
    let fakeAssessmentRecords;
    let fakeCoursesRecords;
    let fakeOrganizationsRecords;

    beforeEach(() => {
      fakeUserRecord = new BookshelfUser({
        'first-name': faker.name.findName(),
        'last-name': faker.name.findName()
      });

      fakeCompetenceRecords = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          areaId: 'areaId1',
          level: -1,
          status: 'notAssessed',
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          areaId: 'areaId2',
          level: -1,
          status: 'notAssessed',
        }];

      fakeAreaRecords = [
        {
          id: 'areaId1',
          name: 'Domaine 1'
        },
        {
          id: 'areaId2',
          name: 'Domaine 2'
        }
      ];

      fakeAssessmentRecords = [Assessment.fromAttributes({
        id: 'assessmentId1',
        courseId: 'courseId8',
        state: 'completed',
        type: Assessment.types.PLACEMENT,
        assessmentResults: [new AssessmentResult({
          pixScore: 10,
          level: 1,
          createdAt: new Date('2018-01-01T05:00:00Z'),
        })]
      })];

      fakeCoursesRecords = [{
        id: 'courseId8',
        nom: 'Test de positionnement 1.1',
        competences: ['competenceId1']
      }];

      fakeOrganizationsRecords = [{
        id: 'organizationId1',
        name: 'orga 1'
      }, {
        id: 'organizationId2',
        name: 'orga 2'
      }];
    });

    describe('Enhanced user', () => {

      beforeEach(() => {

        sinon.stub(userRepository, 'findUserById').resolves(fakeUserRecord);
        sinon.stub(competenceRepository, 'list').resolves(fakeCompetenceRecords);
        sinon.stub(areaRepository, 'list').resolves(fakeAreaRecords);
        sinon.stub(courseRepository, 'getAdaptiveCourses').resolves(fakeCoursesRecords);
        sinon.stub(assessmentRepository, 'findLastAssessmentsForEachCoursesByUser').resolves(fakeAssessmentRecords);
        sinon.stub(assessmentRepository, 'findCompletedAssessmentsByUserId').resolves(fakeAssessmentRecords);
        sinon.stub(organizationRepository, 'findByUserId').resolves(fakeOrganizationsRecords);
      });

      it('should return a resolved promise', () => {
        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should add a default level and status to competences', () => {
        // given
        assessmentRepository.findLastAssessmentsForEachCoursesByUser.resolves([]);
        assessmentRepository.findCompletedAssessmentsByUserId.resolves([]);

        const expectedUser = {
          user: fakeUserRecord,
          competences: [
            {
              id: 'competenceId1',
              name: '1.1 Mener une recherche d’information',
              areaId: 'areaId1',
              level: -1,
              status: 'notAssessed',
              isRetryable: false,
            },
            {
              id: 'competenceId2',
              name: '1.2 Gérer des données',
              areaId: 'areaId2',
              level: -1,
              status: 'notAssessed',
              isRetryable: false,
            }],
          areas: fakeAreaRecords,
          organizations: fakeOrganizationsRecords
        };

        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return promise.then((enhancedUser) => {
          expect(enhancedUser).to.deep.equal(expectedUser);
        });
      });

      it('should return an enhanced user with all competences and area', () => {
        // given
        const expectedUser = {
          user: fakeUserRecord,
          competences: [
            {
              id: 'competenceId1',
              name: '1.1 Mener une recherche d’information',
              areaId: 'areaId1',
              level: 1,
              pixScore: 10,
              assessmentId: 'assessmentId1',
              status: 'assessed',
              isRetryable: true,
            },
            {
              id: 'competenceId2',
              name: '1.2 Gérer des données',
              areaId: 'areaId2',
              level: -1,
              status: 'notAssessed',
              isRetryable: false,
            }],
          areas: fakeAreaRecords,
          organizations: fakeOrganizationsRecords
        };

        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return promise.then((enhancedUser) => {
          expect(enhancedUser).to.deep.equal(expectedUser);
        });
      });

      it('should call course repository to get adaptive courses', () => {
        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return promise.then(() => {
          sinon.assert.called(courseRepository.getAdaptiveCourses);
        });

      });

      it('should call assessment repository to get all assessments from the current user', () => {

        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return promise.then(() => {
          sinon.assert.called(assessmentRepository.findLastAssessmentsForEachCoursesByUser);
          sinon.assert.calledWith(assessmentRepository.findLastAssessmentsForEachCoursesByUser, 'user-id');
        });
      });

      it('should call organization repository to get all organizations from the current user', () => {

        // when
        const promise = profileService.getByUserId('user-id');

        // then
        return promise.then(() => {
          sinon.assert.called(organizationRepository.findByUserId);
          sinon.assert.calledWith(organizationRepository.findByUserId, 'user-id');
        });
      });

    });

  });
});
