import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    const details = this.modelFor('authenticated.campaigns.details');
    return details.belongsTo('campaignCollectiveResult').reload()
      .then(() => details);
  }

});
