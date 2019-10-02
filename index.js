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
    callbackUrl: "http://localhost:7000/saml/sso",
    logoutCallbackUrl: "http://localhost:7000/saml/sso",
    logoutUrl: "http://localhost:7000/saml/sso",
    host: "localhost:8080",
    protocol: "http",
    entryPoint: "https://my-idp.samlidp.io/saml2/idp/SSOService.php",
    cert: fs.readFileSync(`${__dirname}/cert.crt`),
    issuer: "my-idp-saml"
  },
  config: {
    cookieName: "saml-demo",
    routes: {
      metadata: {
        path: "/metadata"
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
