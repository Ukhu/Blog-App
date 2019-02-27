const createError = require("http-errors");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const octaCred = require("./octaCredentials");

const blogRouter = require("./routes/blog");
const usersRouter = require("./routes/users");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "bjknbhbfkwnfrhbgfverhgnuehungcmsguibnjgrg",
    resave: true,
    saveUninitialized: false
  })
);

app.use(octaCred.oidc.router);

app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  octaCred.client.getUser(req.userinfo.sub).then(user => {
    req.user = user;
    res.locals.user = user;
    next();
  });
});

// Routes
app.use("/", blogRouter);
app.use("/users", usersRouter);

// Error handlers
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
