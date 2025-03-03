const { expect, sinon } = require('../../../test-helper');
const snapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');
const Snapshot = require('../../../../lib/infrastructure/data/snapshot');
const queryBuilder = require('../../../../lib/infrastructure/utils/query-builder');

describe('Unit | Repository | SnapshotRepository', function() {

  const serializedUserProfile = {
    data: {
      type: 'users',
      id: 'user_id',
      attributes: {
        'first-name': 'Luke',
        'last-name': 'Skywalker',
        'total-pix-score': 128,
        'email': 'luke@sky.fr'
      },
      relationships: {
        competences: {
          data: [
            { type: 'competences', id: 'recCompA' },
            { type: 'competences', id: 'recCompB' }
          ]
        }
      },
    },
    included: [
      {
        type: 'areas',
        id: 'recAreaA',
        attributes: {
          name: 'area-name-1'
        }
      },
      {
        type: 'areas',
        id: 'recAreaB',
        attributes: {
          name: 'area-name-2'
        }
      },
      {
        type: 'competences',
        id: 'recCompA',
        attributes: {
          name: 'competence-name-1',
          index: '1.1',
          level: -1,
          'course-id': 'recBxPAuEPlTgt72q11'
        },
        relationships: {
          area: {
            data: {
              type: 'areas',
              id: 'recAreaA'
            }
          }
        }
      },
      {
        type: 'competences',
        id: 'recCompB',
        attributes: {
          name: 'competence-name-2',
          index: '1.2',
          level: 8,
          'pix-score': 128,
          'course-id': 'recBxPAuEPlTgt72q99'
        },
        relationships: {
          area: {
            data: {
              type: 'areas',
              id: 'recAreaB'
            }
          }
        }
      }
    ]
  };
  const snapshot = {
    organizationId: 150,
    userId: 4,
    score: 128,
    profile: JSON.stringify(serializedUserProfile)
  };

  describe('#save', () => {
    beforeEach(() => {
      sinon.stub(Snapshot.prototype, 'save').resolves();
    });

    it('should save a snapshot', () => {
      // when
      const promise = snapshotRepository.save(snapshot);

      return promise.then((snapshot) => {
        // then
        expect(snapshot).to.not.be.null;
        sinon.assert.calledOnce(Snapshot.prototype.save);
      });
    });
  });

  describe('#find', () => {
    let options;

    beforeEach(() => {
      sinon.stub(queryBuilder, 'find');

      options = {
        filter: { organisationId: 1 },
      };
    });

    it('should find the snapshots', async () => {
      // given
      queryBuilder.find.withArgs(Snapshot, options).resolves('ok');

      // when
      const result = await snapshotRepository.find(options);

      // then
      expect(result).to.equal('ok');
    });
  });

});
