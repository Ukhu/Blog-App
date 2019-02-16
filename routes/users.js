const express = require("express");

const router = express.Router();

// Okta already handles most of the user functionality
// not much needed to be done again. Although they've provided a
// logout helper it doesn't create an actual route
// so we need to do that here

// Log a user out
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

modules.exports = router;
