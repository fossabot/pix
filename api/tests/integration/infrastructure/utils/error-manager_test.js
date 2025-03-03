const { sinon, expect, hFake } = require('../../../test-helper');
const { send } = require('../../../../lib/infrastructure/utils/error-manager');
const DomainErrors = require('../../../../lib/domain/errors');
const InfraErrors = require('../../../../lib/infrastructure/errors');
const logger = require('../../../../lib/infrastructure/logger');

describe('Integration | Utils | Error Manager', function() {

  let loggerStub;

  beforeEach(() => {
    loggerStub = sinon.stub(logger, 'error').returns();
  });

  describe('#send', function() {

    it('should log the error', function() {
      // given
      const error = new Error();

      // when
      send(hFake, error);

      // then
      sinon.assert.calledOnce(loggerStub);
    });

    it('should return 422 on EntityValidationError', function() {
      // given
      const error = new DomainErrors.EntityValidationError({ invalidAttributes: [] });

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(422);
    });

    it('should return 500 on InfrastructureError', function() {
      // given
      const error = new InfraErrors.InfrastructureError('infra error');

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(500);
      expect(result.source.errors[0].detail).to.equal('infra error');
    });

    it('should return 500 on unknown errors', function() {
      // given
      const error = new Error('unknown error');

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(500);
      expect(result.source.errors[0].detail).to.equal('unknown error');
    });

    it('should return 422 on domain ObjectValidationError', function() {
      // given
      const error = new DomainErrors.ObjectValidationError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(422);
    });

    it('should return 422 on domain InvaliOrganizationIdError', function() {
      // given
      const error = new DomainErrors.InvaliOrganizationIdError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(422);
    });

    it('should return 422 on domain InvalidSnapshotCode', function() {
      // given
      const error = new DomainErrors.InvalidSnapshotCode();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(422);
    });

    it('should return 421 on domain AlreadyRatedAssessmentError', function() {
      // given
      const error = new DomainErrors.AlreadyRatedAssessmentError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(421);
    });

    it('should return 409 on domain ChallengeAlreadyAnsweredError', function() {
      // given
      const error = new DomainErrors.ChallengeAlreadyAnsweredError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(409);
    });

    it('should return 409 on domain AssessmentStartError', function() {
      // given
      const error = new DomainErrors.AssessmentStartError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(409);
    });

    it('should return 409 on domain AssessmentNotCompletedError', function() {
      // given
      const error = new DomainErrors.AssessmentNotCompletedError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(409);
    });

    it('should return 404 on domain UserNotFoundError', function() {
      // given
      const error = new DomainErrors.UserNotFoundError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(404);
    });

    it('should return 404 on domain CampaignCodeError', function() {
      // given
      const error = new DomainErrors.CampaignCodeError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(404);
    });

    it('should return 404 on domain PasswordResetDemandNotFoundError', function() {
      // given
      const error = new DomainErrors.PasswordResetDemandNotFoundError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(404);
    });

    it('should return 404 on domain NotFoundError', function() {
      // given
      const error = new DomainErrors.NotFoundError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(404);
    });

    it('should return 401 on domain InvalidTokenError', function() {
      // given
      const error = new DomainErrors.InvalidTokenError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(401);
    });

    it('should return 401 on domain InvalidTemporaryKeyError', function() {
      // given
      const error = new DomainErrors.InvalidTemporaryKeyError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(401);
    });

    it('should return 403 on domain UserNotAuthorizedToAccessEntity', function() {
      // given
      const error = new DomainErrors.UserNotAuthorizedToAccessEntity();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 403 on domain UserNotAuthorizedToUpdateResourceError', function() {
      // given
      const error = new DomainErrors.UserNotAuthorizedToUpdateResourceError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 403 on domain UserNotAuthorizedToCreateCampaignError', function() {
      // given
      const error = new DomainErrors.UserNotAuthorizedToCreateCampaignError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 403 on domain ForbiddenAccess', function() {
      // given
      const error = new DomainErrors.ForbiddenAccess();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 403 on domain UserNotAuthorizedToCertifyError', function() {
      // given
      const error = new DomainErrors.UserNotAuthorizedToCertifyError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 401 on domain MissingOrInvalidCredentialsError', function() {
      // given
      const error = new DomainErrors.MissingOrInvalidCredentialsError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(401);
    });

    it('should return 403 on domain UserNotAuthorizedToGetCampaignResultsError', function() {
      // given
      const error = new DomainErrors.UserNotAuthorizedToGetCampaignResultsError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(403);
    });

    it('should return 400 on domain WrongDateFormatError', function() {
      // given
      const error = new DomainErrors.WrongDateFormatError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 on domain CertificationCenterMembershipCreationError', function() {
      // given
      const error = new DomainErrors.CertificationCenterMembershipCreationError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 on domain AlreadyExistingMembershipError', function() {
      // given
      const error = new DomainErrors.AlreadyExistingMembershipError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 on domain MembershipCreationError', function() {
      // given
      const error = new DomainErrors.MembershipCreationError();

      // when
      const result = send(hFake, error);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
