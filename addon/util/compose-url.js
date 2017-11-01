import { isNone } from '@ember/utils';
import { A } from '@ember/array';

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
