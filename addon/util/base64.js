import { resolve } from 'rsvp';
import blobutil from './blob-util';

export default string => {
  return resolve().then(() => {
    let blob = blobutil.createBlob([ string ]);
    return blobutil.blobToBase64String(blob);
  });
};
