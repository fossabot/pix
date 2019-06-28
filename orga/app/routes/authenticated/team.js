import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),
  currentOrganization: service(),

  model() {
/*    this.currentOrganization.organization.then((organization) => {
      return organization.get('memberships');
    });*/
    return this.currentOrganization.organization;
  },
});
