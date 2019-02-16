const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const okta = require("@okta/okta-sdk-nodejs");
const session = require("express-session");
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

const blogRouter = require("./routes/blog");
const usersRouter = require("./routes/users");

const app = express();
const client = new okta.Client({
  orgUrl: "https://dev-914359.oktapreview.com",
  token: "00m5N94u1XxKRHgEI2NYS1Vrfswydwh3SLnxFgWEhP"
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const oidc = new ExpressOIDC({
  issuer: "https://dev-914359.oktapreview.com/oauth2/default",
  client_id: "0oajeeovuyLql9avm0h7",
  client_secret: "mbNHnnMWG2FQTKhACw9RUlvu-Zf2qVQeriXZ_vMv",
  redirect_uri: "http://localhost:3000/users/callback",
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

app.use(
  session({
    secret: "bjknbhbfkwnfrhbgfverhgnuehungcmsguibnjgrg",
    resave: true,
    saveUninitialized: false
  })
);

app.use(oidc.router);

app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  client.getUser(req.userinfo.sub).then(user => {
    req.user = user;
    res.locals.user = user;
    next();
  });
});

// Routes
app.use("/", blogRouter);
app.use("/users", usersRouter);

// Error handlers
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
