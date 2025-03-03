import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  actions: {
    logout() {
      return this.session.invalidate();
    }
  }
});
