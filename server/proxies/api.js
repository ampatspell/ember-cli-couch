module.exports = app => {

  let request = require('request');

  let add = (path, base) => {
    app.use(path, (req, res, next) => {
      var target = `${base}${req.url}`;
      req.pipe(request(target).on('error', err => {
        var error = new Error("Proxy");
        error.method = req.method;
        error.url = target;
        error.reason = err.message;
        next(error);
      })).pipe(res);
    });

    let stack = app._router.stack;
    let m = stack.pop();
    stack.unshift(m);
  };

  add('/api/1.6', 'http://127.0.0.1:6016');
  add('/api/2.0', 'http://127.0.0.1:6020');

};
