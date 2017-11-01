import EmberError from '@ember/error';
import { merge } from '@ember/polyfills';
import { A } from '@ember/array';

function message(opts) {
  opts = opts || {};
  if(opts.status) {
    return `${opts.status} ${opts.error}: ${opts.reason}`;
  } else {
    if(opts.error || opts.reason) {
      return `${opts.error}: ${opts.reason}`;
    } else {
      return 'unknown couch error';
    }
  }
}

export function BaseError(opts) {
  EmberError.call(this, message(opts));
  merge(this, opts);
}

BaseError.prototype = Object.create(EmberError.prototype);

BaseError.prototype.toJSON = function() {
  let { status, error, reason, id } = this;

  let hash = {
    error,
    reason
  };

  if(status) {
    hash.status = status;
  }

  if(id) {
    hash.id = id;
  }

  return hash;
};

export function BaseErrors(array) {
  EmberError.call(this, 'Multiple errors');
  this.errors = array;
}

BaseErrors.prototype = Object.create(EmberError.prototype);

BaseErrors.prototype.toJSON = function() {
  let { message, errors } = this;

  errors = A(errors).map(error => error.toJSON ? error.toJSON() : error);

  return {
    message,
    errors
  };
};
