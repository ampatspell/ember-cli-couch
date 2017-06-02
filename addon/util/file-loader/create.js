import FileLoader from './file-loader';

export default function(file) {
  if(!file) {
    return;
  }
  if(file instanceof FileLoader) {
    return file;
  }
  return new FileLoader(file);
}
