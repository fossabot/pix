import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { reject, resolve } from 'rsvp';

module('Integration | Component | login-form', function(hooks) {
  setupRenderingTest(hooks);

  let sessionStub;

  hooks.beforeEach(function() {
    sessionStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
  });

  test('it should ask for email and password', async function(assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('#login-email').exists();
    assert.dom('#login-password').exists();
  });

  test('it should not display error message', async function(assert) {
    // when
    await render(hbs`{{login-form}}`);

    // then
    assert.dom('#login-form-error-message').doesNotExist();
  });

  test('it should call authentication service with appropriate parameters', async function(assert) {
    // given
    sessionStub.prototype.authenticate = function(authenticator, email, password, scope) {
      this.authenticator = authenticator;
      this.email = email;
      this.password = password;
      this.scope = scope;
      return resolve();
    };
    const sessionServiceObserver = this.owner.lookup('service:session');
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'JeMeLoggue1024');

    //  when
    await click('button');

    // then
    assert.equal(sessionServiceObserver.authenticator, 'authenticator:oauth2');
    assert.equal(sessionServiceObserver.email, 'pix@example.net');
    assert.equal(sessionServiceObserver.password, 'JeMeLoggue1024');
    assert.equal(sessionServiceObserver.scope, 'pix-orga');
  });

  test('it should display an error message when authentication fails', async function(assert) {
    // given
    sessionStub.prototype.authenticate = () => reject();
    await render(hbs`{{login-form}}`);
    await fillIn('#login-email', 'pix@example.net');
    await fillIn('#login-password', 'Mauvais mot de passe');

    //  when
    await click('button');

    // then
    assert.dom('#login-form-error-message').exists();
    assert.dom('#login-form-error-message').hasText('L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.');
  });

});
