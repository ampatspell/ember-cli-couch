import Ember from 'ember';

const {
  merge,
  RSVP: { reject, map },
  assert
} = Ember;


export default Ember.Object.extend({

  database: null,

  request() {
    return this.get('database').request(...arguments);
  },

  info() {
    return this.request({
      method: 'get',
      json: true,
    });
  },

  create(opts) {
    opts = merge({ optional: false }, opts);
    return this.request({
      method: 'put',
      json: true,
    }).then(null, (err) => {
      if(err.error === 'file_exists' && opts.optional) {
        return {
          ok: true,
          existed: true
        };
      }
      return reject(err);
    });
  },

  delete(opts) {
    opts = merge({ optional: false }, opts);
    return this.request({
      method: 'delete',
      json: true,
    }).then(null, (err) => {
      if(err.error === 'not_found' && opts.optional) {
        return {
          ok: true,
          existed: false
        };
      }
      return reject(err);
    });
  },

  recreate(opts) {
    opts = merge({ type: 'documents', design: false }, opts);
    if(opts.type === 'documents') {
      let documents = this.get('database');
      return this.create({ optional: true }).then(() => {
        return documents.all({ include_docs: false });
      }).then(data => {
        return map(data.rows, (row) => {
          if(!opts.design && row.id.indexOf('_design') === 0) {
            return;
          }
          return documents.delete(row.id, row.value.rev);
        }).then(() => {
          return { ok: true };
        });
      });
    } else if(opts.type === 'database') {
      return this.delete({ optional: true }).then(() => {
        return this.create();
      }).then(() => {
        return { ok: true };
      });
    }
    assert("opts.type must be either documents or database", false);
  },

});
