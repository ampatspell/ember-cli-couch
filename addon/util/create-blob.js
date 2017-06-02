import blobutil from './blob-util';

export default function(item, type) {
  return blobutil.createBlob([ item ], { type });
}
