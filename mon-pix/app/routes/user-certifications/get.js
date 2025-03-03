import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    return this.store.findRecord('certification', params.id, { reload: true })
      .then((certification) => {
        if (!certification.get('isPublished') || certification.get('status') !== 'validated') {
          return this.replaceWith('/mes-certifications');
        }
        return certification;
      });
  },
});
