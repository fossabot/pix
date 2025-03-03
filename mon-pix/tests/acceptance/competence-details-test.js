import {
  afterEach,
  beforeEach,
  describe,
  it,
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Competence details | Afficher la page de détails d\'une compétence', () => {
  let application;

  beforeEach(() => {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(() => {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', () => {

    let scorecard;
    let area;
    let earnedPix;
    let level;
    let status;
    let pixScoreAheadOfNextLevel;
    let remainingDaysBeforeReset;
    const name = 'Super compétence';
    const description = 'Super description de la compétence';

    beforeEach(async () => {
      await authenticateAsSimpleUser();
      area = server.schema.areas.find(1);
    });

    it('should be able to visit /competences/1_1', async () => {
      // when
      await visit('/competences/1_1');

      // then
      expect(currentURL()).to.equal('/competences/1_1');
    });

    it('should display the competence details', async () => {
      // given
      scorecard = server.create('scorecard', {
        id: '1_1',
        name,
        description,
        earnedPix,
        level,
        pixScoreAheadOfNextLevel,
        area,
        status,
        remainingDaysBeforeReset,
      });

      // when
      await visit(`/competences/${scorecard.id}`);

      // then
      expect(find('.scorecard-details-content-left__area').text()).to.contain(area.title);
      expect(find('.scorecard-details-content-left__area').attr('class')).to.contain('scorecard-details-content-left__area--jaffa');
      expect(find('.scorecard-details-content-left__name').text()).to.contain(name);
      expect(find('.scorecard-details-content-left__description').text()).to.contain(description);
    });

    it('should transition to /profilv2 when the user clicks on return', async () => {
      // given
      await visit('/competences/1_1');

      // when
      await click('.scorecard-details-header__return-button');

      // then
      expect(currentURL()).to.equal('/profilv2');
    });

    context('when there is no knowledge element', () => {

      beforeEach(() => {
        earnedPix = 0;
        level = 0;
        pixScoreAheadOfNextLevel = 0;
        remainingDaysBeforeReset = null;
        status = 'NOT_STARTED';
      });

      it('should not display level or score', async () => {
        // given
        scorecard = server.create('scorecard', {
          id: '1_1',
          name,
          description,
          earnedPix,
          level,
          pixScoreAheadOfNextLevel,
          area,
          status,
          remainingDaysBeforeReset,
        });

        // when
        await visit(`/competences/${scorecard.id}`);

        // then
        expect(find('.competence-card__level .score-value')).to.have.lengthOf(0);
        expect(find('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(0);
        expect(find('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      it('should not display reset button nor reset sentence', async () => {
        // given
        scorecard = server.create('scorecard', {
          id: '1_1',
          name,
          description,
          earnedPix,
          level,
          pixScoreAheadOfNextLevel,
          area,
          status,
          remainingDaysBeforeReset,
        });

        // when
        await visit(`/competences/${scorecard.id}`);

        // then
        expect(find('.scorecard-details__reset-button')).to.have.lengthOf(0);
        expect(find('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
      });
    });

    context('when there are some knowledge elements', () => {

      beforeEach(() => {
        earnedPix = 13;
        level = 2;
        pixScoreAheadOfNextLevel = 5;
        status = 'STARTED';
      });
      it('should display level and score', async () => {
        // given
        scorecard = server.create('scorecard', {
          id: '1_1',
          name,
          description,
          earnedPix,
          level,
          pixScoreAheadOfNextLevel,
          area,
          status,
          remainingDaysBeforeReset,
        });

        // when
        await visit(`/competences/${scorecard.id}`);

        // then
        expect(find('.competence-card__level .score-value').text()).to.equal(level.toString());
        expect(find('.scorecard-details-content-right-score-container__pix-earned .score-value').text()).to.equal(earnedPix.toString());
        expect(find('.scorecard-details-content-right__level-info').text()).to.contain(`${8 - pixScoreAheadOfNextLevel} pix avant le niveau ${level + 1}`);
      });

      it('should not display pixScoreAheadOfNextLevel when next level is over the max level', async () => {
        // given
        scorecard = server.create('scorecard', {
          id: '1_1',
          name: 'Super compétence',
          earnedPix: 7,
          level: 999,
          pixScoreAheadOfNextLevel: 5,
          area: server.schema.areas.find(1),
        });

        // when
        await visit(`/competence/${scorecard.id}`);

        // then
        expect(find('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
      });

      context.skip('when it is remaining some days before reset', () => {

        beforeEach(() => {
          remainingDaysBeforeReset = 5;
        });

        it('should display remaining days before reset', async () => {
          // given
          scorecard = server.create('scorecard', {
            id: '1_1',
            name,
            description,
            earnedPix,
            level,
            pixScoreAheadOfNextLevel,
            area,
            status,
            remainingDaysBeforeReset,
          });

          // when
          await visit(`/competences/${scorecard.id}`);

          // then
          //expect(find('.scorecard-details-content-right__reset-message').text()).to.contain(`Remise à zéro disponible dans ${remainingDaysBeforeReset} jours`);
          expect(find('.scorecard-details__reset-button')).to.have.lengthOf(0);
        });
      });

      context.skip('when it is not remaining days before reset', () => {

        beforeEach(() => {
          remainingDaysBeforeReset = 0;
        });

        it('should display reset button', async () => {
          // given
          scorecard = server.create('scorecard', {
            id: '1_1',
            name,
            description,
            earnedPix,
            level,
            pixScoreAheadOfNextLevel,
            area,
            status,
            remainingDaysBeforeReset,
          });

          // when
          await visit(`/competences/${scorecard.id}`);

          // then
          expect(find('.scorecard-details__reset-button').text()).to.contain('Remettre à zéro');
          expect(find('.scorecard-details-content-right__reset-message')).to.have.lengthOf(0);
        });

        it('should display popup to validate reset', async () => {
          // given
          scorecard = server.create('scorecard', {
            id: '1_1',
            name,
            description,
            earnedPix,
            level,
            pixScoreAheadOfNextLevel,
            area,
            status,
            remainingDaysBeforeReset,
          });
          await visit(`/competences/${scorecard.id}`);

          // when
          await click('.scorecard-details__reset-button');

          // then
          expect(find('.scorecard-details-reset-modal__important-message').text()).to.contain(`Votre niveau ${level} et vos ${earnedPix} Pix vont être supprimés.`);
        });

        it('should reset competence when user clicks on reset', async () => {
          // given
          scorecard = server.create('scorecard', {
            id: '1_1',
            name,
            description,
            earnedPix,
            level,
            pixScoreAheadOfNextLevel,
            area,
            status,
            remainingDaysBeforeReset,
            competenceId: 1,
          });
          await visit(`/competences/${scorecard.id}`);
          await click('.scorecard-details__reset-button');

          // when
          await click('.button--red');

          // then
          expect(find('.competence-card__level .score-value')).to.have.lengthOf(0);
          expect(find('.scorecard-details-content-right-score-container__pix-earned .score-value')).to.have.lengthOf(0);
          expect(find('.scorecard-details-content-right__level-info')).to.have.lengthOf(0);
        });
      });
    });

  });

  describe('Not authenticated cases', () => {
    it('should redirect to home, when user is not authenticated', async () => {
      // when
      await visit('/competences/1_1');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
