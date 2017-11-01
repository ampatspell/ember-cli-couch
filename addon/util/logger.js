const noop = () => {};

const make = name => {
  // eslint-disable-next-line no-console
  const target = typeof console !== 'undefined' ? console : null;
  if(!target) {
    return noop;
  }
  let fn = target[name];
  if(!fn) {
    return noop;
  }
  return fn.bind(target);
}

const info  = make('info');
const warn  = make('warn');
const error = make('error');
const debug = make('debug');

export {
  info,
  warn,
  error,
  debug
};
