/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Emmanuel Sahfor Ngufor Student ID: 135801215 Date: April 15th 2024
 *
 *  Published URL: https://shy-ruby-hare-tie.cyclic.app
 *
 ********************************************************************************/

const authData = require("./modules/auth-service");
const legoData = require("./modules/legoSets");

const express = require("express");
const path = require("path");
const app = express();
const clientSessions = require("client-sessions");

const HTTP_PORT = process.env.PORT || 8080;

// set view engine for EJS
app.set("view engine", "ejs");

app.use(express.static("public")); // Middleware to handle  static files like CSS and Images from public directory
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data : application/x-www-form-urlencoded

// configure session middleware : setup client-sessions to handle sessions
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "WEB322LegoWebApplicationUsingMERN", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

// Adding the session to app.locals : custom middleware to ensure that all templates will have access to a "session" object
// ie: {{session.userName}} for example, we will need this to conditionally hide/show elements to the user depending on their login status
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// GET /home.ejs
app.get("/", (req, res) => {
  res.render("home");
});

// GET /about.ejs
app.get("/about", (req, res) => {
  res.render("about");
});

// GET /login
app.get("/login", (req, res) => {
  res.render("login", { errorMessage: "", userName: "" });
});

// GET /register
app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: "",
    email: "",
  });
});

// POST /register
app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        errorMessage: "",
        successMessage: "User Created",
        userName: "",
        email: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
        email: req.body.email,
      });
    });
});

// POST /login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

// GET /logout
app.get("/logout", (req, res) => {
  req.session.reset(); // Reset session
  res.redirect("/"); // Redirect to home page
});

// GET /userHistory
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory"); // Render userHistory view
});

// GET "/lego/sets"
app.get("/lego/sets", async (req, res) => {
  let sets = [];

  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

// GET "/lego/sets/:num"
app.get("/lego/sets/:num", async (req, res) => {
  try {
    const setId = req.params.num;
    const foundSet = await legoData.getSetByNum(setId);
    if (!foundSet) {
      res.status(404).render("404", {
        message: "No set found for the specified set number: " + setId,
      });
      return;
    }
    res.render("set", { set: foundSet });
  } catch (error) {
    res
      .status(404)
      .render("404", { message: "Error: Unable to find requested set" });
  }
});

// GET "/lego/addSet"
app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// POST /lego/addSet
app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// GET  "/lego/editSet/:num"
app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

//  POST /lego/editSet
app.post("/lego/editSet", ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'am sorry, but we have encountered the following error ${err}`,
    });
  }
});

// DELETE /lego/deleteSet/:num
app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// Handles any routes that are not defined above
// 404 pages - not found - Always goes at the bottom
app.use((req, res) => {
  res.status(404).render("404", {
    message:
      "I'm Sorry, we're unable to find the page you were looking for (︶︹︺)",
  });
});

// Starting up the server
legoData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(`unable to start server: ${err}`);
  });
