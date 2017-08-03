import Ember from 'ember';

const {
  isNone,
  A
} = Ember;

const objectToQueryString = obj => {
  if(!obj) {
    return;
  }
  let pairs = A();
  for(let key in obj) {
    let value = obj[key];
    if(!isNone(value)) {
      pairs.push([key, encodeURIComponent(value)].join('='));
    }
  }
  return pairs.join('&');
};

export default (url, qs) => {
  qs = objectToQueryString(qs);
  if(qs) {
    return `${url}?${qs}`;
  }
  return url;
};
