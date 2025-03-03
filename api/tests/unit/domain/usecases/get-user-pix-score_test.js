const { sinon, expect } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserPixScore = require('../../../../lib/domain/usecases/get-user-pix-score');

describe('Unit | UseCase | get-user-pix-score', () => {

  let knowledgeElementRepository;

  beforeEach(() => {
    knowledgeElementRepository = { getSumOfPixFromUserKnowledgeElements: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should resolve when authenticated user is the same as asked', () => {
    // given
    const authenticatedUserId = 2;
    const requestedUserId = 2;
    knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements.resolves([]);

    // when
    const promise = getUserPixScore({
      authenticatedUserId,
      requestedUserId,
      knowledgeElementRepository,
    });

    // then
    return expect(promise).to.be.fulfilled;
  });

  it('should reject a "UserNotAuthorizedToAccessEntity" domain error when authenticated user is not the one asked', () => {
    // given
    const authenticatedUserId = 34;
    const requestedUserId = 2;
    knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements.resolves([]);

    // when
    const promise = getUserPixScore({
      authenticatedUserId,
      requestedUserId,
      knowledgeElementRepository,
    });

    // then
    return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
  });

  it('should return the user Pix score', async () => {
    // given
    const authenticatedUserId = 2;
    const requestedUserId = 2;
    const sumOfPixKnowledgeElement = 6;
    const pixScoreExpected = {
      id: requestedUserId,
      value: sumOfPixKnowledgeElement
    };

    knowledgeElementRepository.getSumOfPixFromUserKnowledgeElements.resolves(sumOfPixKnowledgeElement);

    // when
    const userPixScore = await getUserPixScore({
      authenticatedUserId,
      requestedUserId,
      knowledgeElementRepository,
    });

    //then
    expect(userPixScore).to.deep.equal(pixScoreExpected);
  });
});
