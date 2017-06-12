import Ember from 'ember';

const {
  A
} = Ember;

export function destroyObject(object) {
  for(let key in object) {
    object[key].destroy();
    delete object[key];
  }
}

export function destroyArray(array) {
  A(array).map(item => {
    item.destroy();
  });
  array.clear();
}
