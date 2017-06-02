import Ember from 'ember';
import createFileLoader from '../util/file-loader/create';
import toBase64 from '../util/base64';

const {
  getOwner,
  computed,
  assert,
  merge,
  typeOf,
  RSVP: { resolve, all },
  A
} = Ember;

const stringifyUnlessEmpty = value => {
  let type = typeOf(value);
  if(type === 'null' || type === 'undefined') {
    return;
  }
  return JSON.stringify(value);
};

const lookup = name => {
  return computed(function() {
    return getOwner(this).factoryFor(name).create({ database: this });
  }).readOnly();
};

export default Ember.Object.extend({

  couch: null,
  name: null,

  security: lookup('couch:database-security'),
  design:   lookup('couch:database-design'),
  database: lookup('couch:database-database'),
  mango:    lookup('couch:database-mango'),

  url: computed('couch.url', 'name', function() {
    let url = this.get('couch.url');
    let name = this.get('name');

    let components = [];
    if(url) {
      if(url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
      components.push(url);
    }
    if(name) {
      components.push(name);
    }
    return components.join('/');
  }).readOnly(),

  request(opts) {
    opts = opts || {};
    let name = this.get('name');
    opts.url = opts.url ? `${encodeURIComponent(name)}/${opts.url}` : name;
    return this.get('couch').request(opts);
  },

  info() {
    return this.get('database').info();
  },

  _encodedIdUrl(id, opts) {
    let encoded = opts.encoded;
    delete opts.encoded;
    if(!id || encoded) {
      return id;
    }
    return encodeURIComponent(id);
  },

  load(id, opts) {
    assert(`id must be string not ${id}`, typeOf(id) === 'string');
    opts = merge({}, opts);

    return this.request({
      method: 'get',
      url: this._encodedIdUrl(id, opts),
      qs: {
        rev: opts.rev,
      },
      json: true
    }).then(null, null, 'sofa:database load');
  },

  _loadAttachment(attachment) {
    if(attachment.stub === true) {
      return false;
    } else {
      return resolve(attachment.data).then(data => {
        if(typeof data === 'string') {
          return toBase64(data);
        } else {
          let file = createFileLoader(data);
          attachment.content_type = file.contentType;
          return file.toBase64String();
        }
      }).then(data => {
        attachment.data = data;
        return true;
      });
    }
  },

  _loadAttachments(doc) {
    let attachments = doc._attachments || {};
    var promises = [];
    for(let name in attachments) {
      let attachment = attachments[name];
      promises.push(this._loadAttachment(attachment));
    }
    return all(promises).then((results) => {
      return A(results).find((result) => {
        return result === true;
      });
    });
  },

  save(doc, opts={}) {
    assert(`Document must be object not ${doc}`, typeOf(doc) === 'object');

    let encodedId = this._encodedIdUrl(doc._id, opts);

    let scope = {};
    return resolve().then(() => {
      return this._loadAttachments(doc).then(has => { scope.attachments = has; });
    }).then(() => {
      let url;
      let method;

      if(doc._id) {
        method = 'put';
        url = encodedId;
      } else {
        method = 'post';
      }

      return this.request({
        method: method,
        url: url,
        json: true,
        body: doc
      });
    }).then(data => {
      if(scope.attachments) {
        data.reload = true;
      }
      return data;
    }, null, 'sofa:database save');
  },

  delete(id, rev, opts={}) {
    assert(`id must be string not ${id}`, typeOf(id) === 'string');
    assert(`rev must be string not ${rev}`, typeOf(rev) === 'string');

    return this.request({
      method: 'delete',
      url: this._encodedIdUrl(id, opts),
      qs: {
        rev: rev
      },
      json: true
    }).then(null, null, 'sofa:database delete document');
  },

  _view(url, opts) {
    opts = merge({}, opts);
    return this.request({
      method: 'get',
      url: url,
      json: true,
      qs: {
        key:              stringifyUnlessEmpty(opts.key),
        keys:             stringifyUnlessEmpty(opts.keys),
        start_key:        stringifyUnlessEmpty(opts.start_key),
        end_key:          stringifyUnlessEmpty(opts.end_key),
        startkey:         stringifyUnlessEmpty(opts.startkey),
        endkey:           stringifyUnlessEmpty(opts.endkey),
        include_docs:     opts.include_docs,
        start_key_doc_id: opts.start_key_doc_id,
        startkey_docid:   opts.startkey_docid,
        endkey_docid:     opts.endkey_docid,
        end_key_doc_id:   opts.end_key_doc_id,
        limit:            opts.limit,
        descending:       opts.descending,
        skip:             opts.skip,
        group:            opts.group,
        group_level:      opts.group_level,
        reduce:           opts.reduce,
        inclusive_end:    opts.inclusive_end,
      }
    }).then(null, null, 'sofa:database _view');
  },

  view(ddoc, name, opts) {
    assert(`ddoc must be string not ${ddoc}`, typeOf(ddoc) === 'string');
    assert(`name must be string not ${name}`, typeOf(name) === 'string');
    let url = `_design/${ddoc}/_view/${name}`;
    return this._view(url, opts).then(null, null, 'sofa:database view');
  },

  all(opts) {
    return this._view('_all_docs', opts).then(null, null, 'sofa:database all');
  },

  willDestroy() {
    this.get('security').destroy();
    this.get('design').destroy();
    this.get('database').destroy();
    this.get('mango').destroy();
    this._super();
  }

});
