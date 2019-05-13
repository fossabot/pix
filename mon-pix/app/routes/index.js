import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  currentUser: service(),

  async beforeModel() {
    const usesProfileV2 = this.currentUser.get('user.usesProfileV2');
    
    if (usesProfileV2) {
      return this.transitionTo('profilv2');
    }

    return this.transitionTo('compte');
  },
});
