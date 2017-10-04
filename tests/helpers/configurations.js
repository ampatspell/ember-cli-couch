import Ember from 'ember';
import createModule, { availableIdentifiers } from './create-module-for-db';

const {
  A
} = Ember;

export default (config, body) => {

  if(typeof config === 'function') {
    body = config;
    config = {};
  }

  if(!config.identifiers) {
    config.identifiers = availableIdentifiers;
  }

  let identifiers = A(config.identifiers);
  identifiers.forEach(identifier => {
    let module = createModule(identifier);
    body(module);
  });

};
