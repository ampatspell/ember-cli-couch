import { typeOf } from '@ember/utils';

export default value => {
  let type = typeOf(value);
  if(type === 'null' || type === 'undefined') {
    return;
  }
  return JSON.stringify(value);
};
