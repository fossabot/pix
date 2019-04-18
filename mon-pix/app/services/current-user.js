import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({

  session: service(),
  store: service(),

  async load() {
    if (this.get('session.isAuthenticated')) {
      const user = await this.store.queryRecord('user', { me: true });

      this.set('user', user);
    }
  }
});
