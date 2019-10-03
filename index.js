const Hapi = require("hapi");
const Boom = require("boom");
const debug = require("debug")("api:main");
const fs = require("fs");

// Create a server with a host and port
const server = (module.exports = new Hapi.Server());
server.connection({
  host: "localhost",
  port: 8080
});

const controllers = [
  {
    register: require("./controllers/saml")
  }
];

const samlOptions = {
  saml: {
    callbackUrl: "http://localhost:8080/api/sso/v1/assert",
    logoutCallbackUrl: "http://localhost:8080/api/sso/v1/notifylogout",
    logoutUrl: "https://zyst.samlidp.io/saml2/idp/SingleLogoutService.php",
    host: "localhost:8080",
    protocol: "http",
    entryPoint: "https://zyst.samlidp.io/saml2/idp/SSOService.php",
    decryptionPvk: fs.readFileSync(__dirname + "/private.key").toString(),
    cert: '...',
    issuer: "my-idp-saml"
  },
  config: {
    cookieName: "session",
    decryptionCert: '...',
    routes: {
      metadata: {
        path: "https://zyst.samlidp.io/saml2/idp/metadata.php"
      },
      assert: {
        path: "/api/sso/v1/assert"
      }
    },
    assertHooks: {
      onResponse: profile => {
        const username = profile["urn:oid:2.5.4.4"];
        return Object.assign(profile, {
          username
        });
      }
    }
  }
};

const serverPlugins = [
  {
    register: require("hapi-passport-saml"),
    options: samlOptions
  }
];

const schemeOpts = {
  password:
    "aljkjkl123123jkl;123jkl;1jkl;2jkl;asdfjkl;fjkl;asdfjkl;sdahjlghjklasdghjksdahfjkdhsajklhyeruiwhyqafhjkldsjklfahsdjkflhasdjklfhasdjklfhasdfhjkld",
  isSecure: false,
  isHttpOnly: false,
  name: "session"
};

server.register(serverPlugins, function(err) {
  server.auth.strategy("single-sign-on", "saml", schemeOpts);
  server.register(
    controllers,
    {
      routes: {
        prefix: "/api"
      }
    },
    function() {
      if (!module.parent) {
        server.start(function() {
          console.log("Server started at port " + server.info.port);
        });
      }
    }
  );
});
