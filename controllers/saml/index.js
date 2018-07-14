const samlCtrl = require('./v1');

exports.register = function (plugin, options, next) {

 // Secure page
  plugin.route({
    method: 'GET',
    path: '/sso/main',
    config: {
      auth: 'single-sign-on',
      handler: samlCtrl.main,
    }
  });

// Start page (public)
  plugin.route({
    method: 'GET',
    path: '/sso/init',
    config: {
      handler: samlCtrl.init,
    }
  });
  
  // Logout
  plugin.route({
    method: 'GET',
    path: '/sso/v1/logout',
    config: {
      auth: 'single-sign-on',
      handler: samlCtrl.logout,
    }
  });

// Logout callback
  plugin.route({
    method: 'POST',
    path: '/sso/v1/notifylogout',
    config: {
      handler: samlCtrl.notifylogout,
    }
  });

  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};