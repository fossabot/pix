import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Compte | Competence profile', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /compte', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visit('/compte');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/compte');
    });
  });

  it('should redirect to home, when user is not found', async function() {
    // when
    await visit('/compte');
    return andThen(() => {
      expect(currentURL()).to.equal('/connexion');
    });
  });

  it('should display user competences (with level) grouped by area', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.competence-by-area-item').length).to.equal(5);
      expect(find('.competence').length).to.equal(16);
    });
  });

  it('should display a link ’commencer’ with the correct url to start an adaptive course, for the first competence', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.competence-level-progress-bar__link-start:first').attr('href')).to.be.equal('/courses/ref_course_id');
    });
  });

  it('should display a hero banner for logged user', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.logged-user-profile-banner')).to.have.lengthOf(1);
    });
  });
});
