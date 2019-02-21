import hbs from 'htmlbars-inline-precompile';
import { storiesOf } from '@storybook/ember';

storiesOf('Input')
  .add('Pix Input Empty', () => {
    return {
      template: hbs`{{input
        type='text'
        maxlength='255'
        class='input'
    }}`
    }
  })
  .add('Pix Input Filled', () => {
    return {
      template: hbs`{{input
        type='text'
        maxlength='255'
        value='Pix Input'
        class='input'
    }}`
    }
  })
  .add('Pix Input Focus', () => {
    return {
      template: hbs`{{input
        type='text'
        maxlength='255'
        value='Pix Input'
        class='input'
        autofocus=true
    }}`
    }
  });
