import Ember from 'ember';

const {
  typeOf
} = Ember;

export default value => {
  let type = typeOf(value);
  if(type === 'null' || type === 'undefined') {
    return;
  }
  return JSON.stringify(value);
};
