import { configure } from '@storybook/ember';

function loadStories() {
  require('../stories/Button');
  require('../stories/Input');
  require('../stories/Text');
}

configure(loadStories, module);
