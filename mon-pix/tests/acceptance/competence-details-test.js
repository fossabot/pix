import { find, click, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Competence details | Afficher la page de detail d\'une compétence', () => {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Authenticated cases as simple user', () => {

    beforeEach(async () => {
      await authenticateAsSimpleUser();
    });

    it('can visit /competences/1_1', async () => {
      // when
      await visitWithAbortedTransition('/competences/1_1');

      // then
      expect(currentURL()).to.equal('/competences/1_1');
    });

    it('displays the competence details', async () => {
      // given
      const name = 'Super compétence';
      const description = 'Super description de la compétence';
      const earnedPix = 7;
      const level = 4;
      const pixScoreAheadOfNextLevel = 5;
      const area = this.server.schema.areas.find(1);

      const scorecard = this.server.create('scorecard', {
        id: '1_1',
        name,
        description,
        earnedPix,
        level,
        pixScoreAheadOfNextLevel,
        area,
      });

      // when
      await visitWithAbortedTransition(`/competences/${scorecard.id}`);

      // then
      expect(find('.scorecard-details-content-left__area').textContent).to.contain(area.title);
      expect(find('.scorecard-details-content-left__area').getAttribute('class')).to.contain('scorecard-details-content-left__area--jaffa');
      expect(find('.scorecard-details-content-left__name').textContent).to.contain(name);
      expect(find('.scorecard-details-content-left__description').textContent).to.contain(description);
      expect(find('.score-value').textContent).to.contain(level);
      expect(find('.score-value').textContent).to.contain(earnedPix);
      expect(find('.scorecard-details-content-right__level-info').textContent).to.contain(`${8 - pixScoreAheadOfNextLevel} pix avant le niveau ${level + 1}`);
    });

    it('Does not display pixScoreAheadOfNextLevelwhen next level is over the max level', async () => {
      // given
      const scorecard = this.server.create('scorecard', {
        id: '1_1',
        name: 'Super compétence',
        earnedPix: 7,
        level: 999,
        pixScoreAheadOfNextLevel: 5,
        area: this.server.schema.areas.find(1),
      });

      // when
      await visitWithAbortedTransition(`/competence/${scorecard.id}`);

      // then
      expect(find('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
    });

    it('should transition to /profilv2 when the user clicks on return', async () => {
      // given
      await visitWithAbortedTransition('/competences/1_1');

      // when
      await click('.scorecard-details-header__return-button');

      // then
      expect(currentURL()).to.equal('/profilv2');
    });
  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visitWithAbortedTransition('/competences/1_1');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
