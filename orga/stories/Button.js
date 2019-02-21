import hbs from 'htmlbars-inline-precompile';
import { storiesOf } from '@storybook/ember';

storiesOf('Button')
  .add('Pix Blue Button', () => {
    return {
      template: hbs`<button class="button" type="submit">Pix Button</button>`
    }
  })
  .add('Pix White Button', () => {
    return {
      template: hbs`<button class="button button--white" type="submit">Pix Button</button>`
    }
  })
  .add('Pix No Color Button', () => {
    return {
      template: hbs`<button class="button button--no-color" type="submit">Pix Button</button>`
    }
  })
  .add('Pix Big Button', () => {
    return {
      template: hbs`<button class="button button--big" type="submit">Pix Button</button>`
    }
  })
  .add('Pix Extra Big Button', () => {
    return {
      template: hbs`<button class="button button--extra-big" type="submit">Pix Button</button>`
    }
  });
