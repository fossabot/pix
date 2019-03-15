import Component from '@ember/component';
import { parse } from 'papaparse';

export default Component.extend({

  tooltipText: 'Copier le lien direct',
  candidates: null,

  actions: {
    clipboardSuccess() {
      this.set('tooltipText', 'Copié !');
    },

    clipboardOut() {
      this.set('tooltipText', 'Copier le code d\'accès');
    },

    preview(string) {
      const that = this;
      parse(string, {
        skipEmptyLines: true,
        preview: 10,
        dynamicTyping: true,
        complete: function (results) {
          const data = results.data.map((result) => {
            return {
              lastName: result[0],
              firstName: result[1],
              birthdate: result[2],
              birthplace: result[3],
            };
          });
          that.set('candidates', data);
        },
        error: function () {
          that.set('candidates', null);
        }
      })
    },

    import(string) {
      const that = this;
      parse(string, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data = results.data.map((result) => {
            return {
              lastName: result[0],
              firstName: result[1],
              birthdate: result[2],
              birthplace: result[3],
            };
          });
          that.set('candidates', data);
        },
        error: function () {
          that.set('candidates', null);
        }
      });

    }
  }
});
