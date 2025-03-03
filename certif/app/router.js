import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  metrics: service(),

  init() {
    this._super(...arguments);
    this.on('routeDidChange', () => {
      this._trackPage();
    });
  },

  _trackPage() {
    scheduleOnce('afterRender', this, () => {
      const page = this.url;
      const title = this.getWithDefault('currentRouteName', 'unknown');
      this.metrics.trackPage({ page, title });
    });
  }
});

Router.map(function() {
  this.route('login', { path: 'connexion' });

  this.route('authenticated', { path: '' }, function() {
    this.route('terms-of-service', { path: '/cgu' });
    this.route('sessions', { path: '/sessions' }, function() {
      this.route('list', { path: '/liste' });
      this.route('new', { path: '/creation' });
      this.route('update', { path: '/:session_id/modification' });
      this.route('details', { path: '/:session_id' });
    });
  });

  this.route('logout');

  this.route('not-found', { path: '/*path' });
});

export default Router;
