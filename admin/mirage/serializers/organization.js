import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(organization) {
    return {
      'memberships': {
        related: `/api/organizations/${organization.id}/memberships`
      }
    };
  }

});
