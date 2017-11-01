import { Promise } from 'rsvp';
import { run } from '@ember/runloop';

export function next() {
  return new Promise(resolve => {
    run.next(resolve);
  });
}

export function later(delay=0) {
  return new Promise(resolve => {
    run.later(resolve, delay);
  });
}
