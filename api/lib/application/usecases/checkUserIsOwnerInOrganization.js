const membershipRepository = require('../../infrastructure/repositories/membership-repository');

module.exports = {

  execute(userId, organizationId) {
    return membershipRepository.findByUserIdAndOrganizationId(userId, organizationId)
      .then((user) => user.hasRolePixMaster);
  }
};
