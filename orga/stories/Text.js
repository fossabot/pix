import hbs from 'htmlbars-inline-precompile';
import { storiesOf } from '@storybook/ember';

storiesOf('Text')
  .add('Label', () => {
    return {
      template: hbs`<label class="label">Text</label>`
    }
  })
  .add('Label Text', () => {
    return {
      template: hbs`<h4 class="label-text">Label Text</h4>`
    }
  })
  .add('Content Text', () => {
    return {
      template: hbs`<div class="content-text">Content Text</div>`
    }
  })
  .add('Paragraph', () => {
    return {
      template: hbs`<div class="paragraph">Paragraph Text</div>`
    }
  })
  .add('Information Text', () => {
    return {
      template: hbs`<div class="information-text">Information Text</div>`
    }
  })
  .add('Help Text', () => {
    return {
      template: hbs`<div class="help-text">Help Text</div>`
    }
  });
