import Ember from 'ember';

const {
  merge,
  typeOf,
  isArray,
  RSVP: { reject }
} = Ember;

export default Ember.Object.extend({

  database: null,

  _stringify(arg) {
    let type = typeOf(arg);
    if(type === 'array') {
      let ret = [];
      for(let i = 0; i < arg.length; i++) {
        ret.push(this._stringify(arg[i]));
      }
      return ret;
    } else if(type === 'object') {
      let ret = {};
      for(let key in arg) {
        ret[key] = this._stringify(arg[key]);
      }
      return ret;
    } else if(type === 'function') {
      let string = arg.toString();
      // es6 transpiler adds function name, CouchDB doesn't like it
      string = string.replace(/(function) ([\w]+)/g, '$1');
      return string;
    }
    return arg;
  },

  _build(name, hash) {
    return merge({ _id: this.id(name), language: 'javascript' }, this._stringify(hash));
  },

  _typeOf(a) {
    if(isArray(a)) {
      return 'array';
    }
    return typeOf(a);
  },

  _deepEqual(a, b) {
    let type = this._typeOf(a);
    if(type !== this._typeOf(b)) {
      return false;
    }
    if(type === 'object') {
      if(Object.keys(a).length !== Object.keys(b).length) {
        return false;
      }
      for(let key in a) {
        if(!this._deepEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    } else if(type === 'array') {
      if(a.length !== b.length) {
        return false;
      }
      for(let i = 0; i < a.length; i++) {
        if(!this._deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    return a === b;
  },

  id(name) {
    return `_design/${name}`;
  },

  load(name, opts) {
    opts = merge({ optional: false }, opts);
    let id = this.id(name);
    return this.get('database').load(id, { encoded: true }).then((doc) => {
      return doc;
    }, (err) => {
      if(opts.optional && err.status === 404) {
        return;
      }
      return reject(err);
    });
  },

  save(name, hash) {
    let doc = this._build(name, hash);
    return this.load(name, { encoded: true, optional: true }).then((cur) => {
      if(cur) {
        doc._rev = cur._rev;
        if(this._deepEqual(doc, cur)) {
          return { ok: true, id: doc._id, rev: doc._rev, saved: false };
        }
      }
      return this.get('database').save(doc, { encoded: true }).then((data) => {
        data.saved = true;
        return data;
      });
    });
  },

  delete(name, opts) {
    opts = merge({ optional: false }, opts);
    return this.load(name, { optional: opts.optional }).then((cur) => {
      if(cur) {
        return this.get('database').delete(cur._id, cur._rev, { encoded: true }).then((data) => {
          data.deleted = true;
          return data;
        });
      }
      return { ok: true, id: this.id(name), deleted: false };
    });
  },

});
