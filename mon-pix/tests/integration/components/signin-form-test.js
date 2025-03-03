import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, fillIn, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | signin form', function() {

  setupRenderingTest();

  describe('Rendering', async function() {

    it('should display an input for email field', async function() {
      // when
      await render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('input#email')).to.exist;
    });

    it('should display an input for password field', async function() {
      // when
      await render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('input#password')).to.exist;
    });

    it('should display a submit button to authenticate', async function() {
      // when
      await render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('button.button')).to.exist;
    });

    it('should display a link to password reset view', async function() {
      // when
      await render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('a.sign-form-body__forgotten-password-link')).to.exist;
    });

    it('should not display any error by default', async function() {
      // when
      await render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('div.sign-form__notification-message')).to.not.exist;
    });

    it('should display an error if authentication failed', async function() {
      // given
      this.set('displayErrorMessage', true);

      // when
      await render(hbs`{{signin-form displayErrorMessage=displayErrorMessage}}`);

      // then
      expect(document.querySelector('div.sign-form__notification-message--error')).to.exist;
    });
  });

  describe('Behaviours', function() {

    it('should authenticate user when she submitted sign-in form', async function() {
      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.set('onSubmitAction', function(email, password) {
        // then
        expect(email).to.equal(expectedEmail);
        expect(password).to.equal(expectedPassword);
        return Promise.resolve();
      });

      await render(hbs`{{signin-form authenticateUser=(action onSubmitAction)}}`);

      await fillIn('input#email', expectedEmail);
      await triggerEvent('input#email', 'change');
      await fillIn('input#password', expectedPassword);
      await triggerEvent('input#password', 'change');

      // when
      await click('button.button');
    });

  });
});
