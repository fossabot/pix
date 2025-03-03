import { on } from '@ember/object/evented';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import {
  EKMixin as EmberKeyboardMixin,
  keyDown
} from 'ember-keyboard';

export default Component.extend(EmberKeyboardMixin, {

  currentUser: service(),
  routing: service('-routing'),

  classNames: ['logged-user-details'],

  keyboardActivated: true,
  _canDisplayMenu: false,
  _user: null,

  canDisplayLinkToProfile: computed('currentUser.user.usesProfileV2', 'routing.currentRouteName', function() {
    const currentRouteName = this.get('routing.currentRouteName');

    if (this.get('currentUser.user.usesProfileV2')) {
      return currentRouteName !== 'profilv2' && currentRouteName !== 'board';
    }

    return currentRouteName !== 'compte' && currentRouteName !== 'board';
  }),

  closeOnEsc: on(keyDown('Escape'), function() {
    this.set('_canDisplayMenu', false);
  }),

  actions: {
    toggleUserMenu() {
      this.toggleProperty('_canDisplayMenu');
    },

    closeMenu() {
      this.set('_canDisplayMenu', false);
    }
  }
});
