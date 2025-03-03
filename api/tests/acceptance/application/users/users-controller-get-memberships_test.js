const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-memberships', () => {

  let userId;
  let organizationId;
  let membershipId;
  let organizationRoleId;

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/memberships', () => {

    function _insertOrganization(userId) {
      const organizationRaw = {
        name: 'The name of the organization',
        type: 'SUP',
        code: 'AAA111',
        userId,
      };

      return knex('organizations').insert(organizationRaw).returning('id');
    }

    function _insertUser() {
      const userRaw = {
        'firstName': 'john',
        'lastName': 'Doe',
        'email': 'john.Doe@internet.fr',
        password: 'Pix2017!',
      };

      return knex('users').insert(userRaw).returning('id');
    }

    function _insertMemberships(organizationId, userId, organizationRoleId) {
      const membershipRaw = {
        organizationId,
        userId,
        organizationRoleId,
      };

      return knex('memberships').insert(membershipRaw).returning('id');
    }

    function _insertOrganizationRoles() {
      const organizationRoleRaw = {
        name: 'ADMIN',
      };

      return knex('organization-roles').insert(organizationRoleRaw).returning('id');
    }

    function _options(userId) {
      return {
        method: 'GET',
        url: `/api/users/${userId}/memberships`,
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    }

    beforeEach(() => {
      return _insertUser()
        .then(([id]) => userId = id)
        .then(() => _insertOrganization(userId))
        .then(([id]) => organizationId = id)
        .then(() => _insertOrganizationRoles()
          .then(([id]) => organizationRoleId = id)
          .then(() => _insertMemberships(organizationId, userId, organizationRoleId))
          .then(([id]) => membershipId = id));
    });

    afterEach(() => {
      return knex('users').delete()
        .then(() => knex('organizations').delete())
        .then(() => knex('memberships').delete());
    });

    it('should return found accesses with 200 HTTP status code', () => {
      // when
      const promise = server.inject(_options(userId));

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'memberships',
              id: membershipId.toString(),
              attributes: {},
              relationships: {
                'organization': { data: { type: 'organizations', id: organizationId.toString() }, },
                'organization-role': { data: { type: 'organizationRoles', id: organizationRoleId.toString() }, },
                'user': { data: null, },
              },
            },
          ],
          included: [
            {
              type: 'organizations',
              id: organizationId.toString(),
              attributes: {
                name: 'The name of the organization',
                type: 'SUP',
                code: 'AAA111',
              },
              relationships: {
                campaigns: {
                  links: {
                    related: `/api/organizations/${organizationId.toString()}/campaigns`
                  }
                },
                'target-profiles': {
                  links: {
                    related: `/api/organizations/${organizationId.toString()}/target-profiles`
                  }
                }
              }
            },
            { type: 'organizationRoles', id: organizationRoleId.toString(), attributes: { name: 'ADMIN' } }
          ],
        });
      });
    });
  });
});
