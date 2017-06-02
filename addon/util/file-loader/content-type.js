import Ember from 'ember';

const {
  isEmpty,
  A
} = Ember;

let _raw = {
  'png':  'image/png',
  'jpg jpeg': 'image/jpeg',
  'pdf': 'application/pdf',
  'psd': 'image/vnd.adobe.photoshop',
  'mp4 mp4v mpg4 m4v': 'video/mp4',
  'mpeg mpg mpe m1v m2v': 'video/mpeg',
  'txt': 'text/plain',
  'hbs handlebars': 'text/x-handlebars-template',
  'md markdown': 'text/x-markdown',
  'js': 'text/javascript',
  'mpga mp2 mp2a mp3 m2a m3a': 'audio/mpeg',
};

let _mapping;

function mapping() {
  if(!_mapping) {
    _mapping = {};
    for(let key in _raw) {
      let value = _raw[key];
      let keys = A(key.split(' '));
      for(let i = 0; i < keys.length; i++) {
        let key = keys[i];
        _mapping[key] = value;
      }
    }
  }
  return _mapping;
}

function extnameFromFilename(name) {
  let idx = name.lastIndexOf('.');
  if(idx > 0) {
    return name.substr(idx + 1);
  }
}

export function contentTypeForFileName(filename) {
  let extname = extnameFromFilename(filename);
  if(extname) {
    extname = extname.toLowerCase();
    return mapping()[extname];
  }
}

export default function contentTypeForFile(file) {
  let type = file.type;
  if(isEmpty(type)) {
    let name = file.name;
    if(name) {
      type = contentTypeForFileName(name);
      if(type) {
        return type;
      }
    }
    return 'application/octet-stream';
  }
  return type;
}
