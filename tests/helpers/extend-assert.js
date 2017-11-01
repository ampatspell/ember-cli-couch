import { typeOf } from '@ember/utils';

function replaceIgnored(doc, ignores) {
  let type = typeOf(doc);
  if(type === 'array') {
    return doc.map(function(item) {
      return replaceIgnored(item, ignores);
    });
  } else if(type === 'object') {
    let res = {};
    for(let key in doc) {
      let value = doc[key];
      if(ignores.indexOf(key) !== -1) {
        value = 'ignored';
      }
      res[key] = replaceIgnored(value, ignores);
    }
    return res;
  } else {
    return doc;
  }
}

function deepEqual(assert) {
  let ignores = ['rev', '_rev', 'revpos', 'digest'];
  return function(a, b) {
    let a_ = replaceIgnored(a, ignores);
    let b_ = replaceIgnored(b, ignores);
    return assert.deepEqual(a_, b_);
  };
}

export default function(assert) {
  assert.deepEqual_ = deepEqual(assert);
  return assert;
}
