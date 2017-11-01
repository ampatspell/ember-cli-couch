import { Promise } from 'rsvp';
import { run } from '@ember/runloop';

export const wait = (arg, delay) => new Promise(resolve => run.later(() => resolve(arg), delay));

export const waitFor = fn => {
  let start = new Date();
  return new Promise((resolve, reject) => {
    let i = setInterval(() => {
      if(fn()) {
        resolve();
        clearInterval(i);
      } else {
        let now = new Date();
        if(now - start > 20000) {
          reject(new Error('took more than 20 seconds'));
          clearInterval(i);
        }
      }
    }, 50);
  });
}
