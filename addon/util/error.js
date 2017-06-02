import Ember from 'ember';

const {
  merge,
  A
} = Ember;

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

export default function CouchError(opts) {
  Ember.Error.call(this, message(opts));
  merge(this, opts);
}

CouchError.prototype = Object.create(Ember.Error.prototype);

CouchError.prototype.toJSON = function() {
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

export function CouchErrors(array) {
  Ember.Error.call(this, 'Multiple errors');
  this.errors = array;
}

CouchErrors.prototype = Object.create(Ember.Error.prototype);

CouchErrors.prototype.toJSON = function() {
  let { message, errors } = this;

  errors = A(errors).map(error => error.toJSON ? error.toJSON() : error);

  return {
    message,
    errors
  };
};
