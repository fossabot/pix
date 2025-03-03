import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  normalizeFindRecordResponse(store, primaryModelClass, payload, id) {
    payload.data.id = id;
    return this.normalizeSingleResponse(...arguments);
  },

  extractAttributes() {
    const attributes = this._super(...arguments);
    if (attributes['birthdate']) {
      attributes['birthdate'] = (new Date(attributes['birthdate'])).toLocaleDateString('fr-FR');
    }
    return attributes;
  },

  serialize(snapshot, options) {
    if (options && options.onlyInformation) {
      const data = {};
      this.serializeAttribute(snapshot, data, 'firstName', 'first-name');
      this.serializeAttribute(snapshot, data, 'lastName', 'last-name');
      this.serializeAttribute(snapshot, data, 'birthplace', 'birthplace');
      this.serializeAttribute(snapshot, data, 'birthdate', 'birthdate');
      this.serializeAttribute(snapshot, data, 'externalId', 'external-id');
      this.serializeAttribute(snapshot, data, 'isPublished', 'is-published');
      data.type = 'certifications';
      if (options.includeId) {
        data.id = parseInt(snapshot.id);
      }
      return { data: data };
    } else {
      return this._super(...arguments);
    }
  },

  modelNameFromPayloadKey() {
    return 'certification';
  }
});
