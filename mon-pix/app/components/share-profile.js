import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import Component from '@ember/component';

const ORGANIZATION_CODE_PLACEHOLDER = 'Ex: ABCD12';
const STEP_1_ORGANIZATION_CODE_ENTRY = 'organization-code-entry';
const STEP_2_SHARING_CONFIRMATION = 'sharing-confirmation';
const STEP_3_SUCCESS_NOTIFICATION = 'success-notification';

export default Component.extend({

  classNames: ['share-profile'],

  // Actions
  searchForOrganization: null,
  shareProfileSnapshot: null,

  // Internals
  _showingModal: false,
  _view: STEP_1_ORGANIZATION_CODE_ENTRY,
  _placeholder: ORGANIZATION_CODE_PLACEHOLDER,
  _code: null,
  _organization: null,
  _organizationNotFound: false,
  _studentCode: null,
  _campaignCode: null,

  // Computed
  stepOrganizationCodeEntry: equal('_view', STEP_1_ORGANIZATION_CODE_ENTRY),
  stepProfileSharingConfirmation: equal('_view', STEP_2_SHARING_CONFIRMATION),
  isOrganizationHasTypeSupOrPro: computed('_organization.type', function() {
    return this.get('_organization.type') === 'SUP' || this.get('_organization.type') === 'PRO';
  }),

  organizationLabels: computed('_organization.type', function() {
    if (this.get('_organization.type') === 'PRO') {
      return {
        personalCode: 'Veuillez saisir votre ID-Pix :',
        text1: 'Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'organisation :',
        text2: 'En cliquant sur le bouton « Envoyer », vous transmettrez à l\'organisation :',
        text3: 'votre ID-Pix et le code campagne',
        text4: 'L\'organisation ne recevra les évolutions futures de votre profil que si vous l\'envoyez à nouveau.'
      };
    } else if (this.get('_organization.type') === 'SUP') {
      return {
        personalCode: 'Veuillez saisir votre numéro d\'étudiant :',
        text1: 'Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'établissement :',
        text2: 'En cliquant sur le bouton « Envoyer », vous transmettrez à l\'établissement :',
        text3: 'votre numéro d\'étudiant et le code campagne',
        text4: 'L\'établissement ne recevra les évolutions futures de votre profil que si vous l\'envoyez à nouveau.'
      };
    } else {
      return {
        personalCode: 'Veuillez saisir votre numéro INE :',
        text1: 'Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'établissement :',
        text2: 'En cliquant sur le bouton « Envoyer », vous transmettrez à l\'établissement :',
        text3: 'le code campagne',
        text4: 'L\'établissement ne recevra les évolutions futures de votre profil que si vous l\'envoyez à nouveau.'
      };

    }
  }),

  actions: {

    openModal() {
      this.set('_showingModal', true);
    },

    closeModal() {
      this.set('_showingModal', false);
      this.set('_view', STEP_1_ORGANIZATION_CODE_ENTRY);
      this.set('_code', null);
      this.set('_organization', null);
      this.set('_organizationNotFound', false);
      this.set('_studentCode', null);
      this.set('_campaignCode', null);
    },

    cancelSharingAndGoBackToOrganizationCodeEntryView() {
      this.set('_view', STEP_1_ORGANIZATION_CODE_ENTRY);
      this.set('_organization', null);
      this.set('_organizationNotFound', false);
      this.set('_studentCode', null);
      this.set('_campaignCode', null);
    },

    findOrganizationAndGoToSharingConfirmationView() {
      this.searchForOrganization(this._code)
        .then((organization) => {
          if (organization) {
            this.set('_view', STEP_2_SHARING_CONFIRMATION);
            this.set('_organization', organization);
            this.set('_organizationNotFound', false);
          } else {
            this.set('_organizationNotFound', true);
          }
        });
    },

    shareSnapshotAndGoToSuccessNotificationView() {
      this.shareProfileSnapshot(this._organization, this._studentCode, this._campaignCode)
        .then(() => {
          this.set('_view', STEP_3_SUCCESS_NOTIFICATION);
        });
    },

    focusInOrganizationCodeInput() {
      this.set('_placeholder', null);
    },

    focusOutOrganizationCodeInput() {
      this.set('_placeholder', ORGANIZATION_CODE_PLACEHOLDER);
    }
  }
});
