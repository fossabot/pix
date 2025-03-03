import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Collective Result', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async () => {
    server.logging = true;
    user = createUserWithMembership();
    await authenticateSession({
      user_id: user.id,
    });
    const campaignReport = server.create('campaign-report', { sharedParticipationCount: 3 });
    const campaignCollectiveResult = server.create('campaign-collective-result', 'withCompetenceCollectiveResults');
    server.create('campaign', {
      id: 1,
      campaignCollectiveResult,
      campaignReport,
    });
  });

  test('it should display campain collective result', async function(assert) {
    // when
    await visit('/campagnes/1/resultats-collectifs');

    // then
    assert.dom('.table__empty').doesNotExist();

    assert.dom('table tbody tr:first-child td:first-child span:nth-child(2)').hasText('Competence A');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('50%');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('5');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('10');
  });
});
