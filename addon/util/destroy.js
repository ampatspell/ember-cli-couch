export function destroyObject(object) {
  for(let key in object) {
    object[key].destroy();
    delete object[key];
  }
}
