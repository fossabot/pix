import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login page', function() {
  setupTest('route:login', {
    needs: ['service:session', 'service:current-routed-modal', 'service:metrics']
  });

  context('when user is not authenticated', function() {
    let authenticateStub;
    let queryRecordStub;
    const expectedEmail = 'email@example.net';
    const expectedPassword = 'azerty';

    beforeEach(function() {
      queryRecordStub = sinon.stub();
      authenticateStub = sinon.stub();
      this.register('service:session', Service.extend({
        authenticate: authenticateStub,
      }));
      this.inject.service('session', { as: 'session' });

      this.register('service:store', Service.extend({
        queryRecord: queryRecordStub
      }));
      this.inject.service('store', { as: 'store' });
    });

    it('should authenticate the user given email and password', async function() {
      // Given
      authenticateStub.resolves();

      const foundUser = EmberObject.create({ id: 12 });
      queryRecordStub.resolves(foundUser);
      const route = this.subject();
      sinon.stub(route, 'transitionTo').throws('Must not be called');

      // When
      await route.beforeModel({});
      await route.actions.signin.call(route, expectedEmail, expectedPassword);

      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', { email: expectedEmail, password: expectedPassword });
    });

    it('should authenticate the user given token in URL', async function() {
      // Given
      authenticateStub.resolves();

      const route = this.subject();
      sinon.stub(route, 'transitionTo');

      // When
      await route.beforeModel({ queryParams: { token: 'dummy-token', 'user-id': '123' } });

      // Then
      sinon.assert.calledWith(authenticateStub, 'authenticator:simple', { token: 'dummy-token', userId: 123 });
      sinon.assert.calledWith(route.transitionTo, 'compte');
    });
  });

  context('when user is authenticated', function() {
    beforeEach(function() {
      this.register('service:session', Service.extend({
        isAuthenticated: true
      }));
      this.inject.service('session', { as: 'session' });
    });

    it('should redirect authenticated users to /compte', async function() {
      // Given
      const route = this.subject();
      sinon.stub(route, 'transitionTo');

      // When
      await route.beforeModel({});

      // Then
      sinon.assert.calledWith(route.transitionTo, 'compte');
    });
  });
});
