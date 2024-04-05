/********************************************************************************
 *  WEB322 – Assignment 05
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Emmanuel Sahfor Ngufor Student ID: 135801215 Date: April 7th 2024
 *
 *  Published URL: https://shy-ruby-hare-tie.cyclic.app
 *
 ********************************************************************************/

const legoData = require("./modules/legoSets");

const express = require("express");
const path = require("path");
const app = express();

// set view engine for EJS
app.set("view engine", "ejs");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // parse form data

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// GET "/lego/sets"
app.get("/lego/sets", async (req, res) => {
  try {
    const theme = req.query.theme;
    if (theme) {
      const setsInTheme = await legoData.getSetsByTheme(theme);
      if (setsInTheme.length === 0) {
        const message = `No sets found for theme "${req.query.theme}"`;
        return res.status(404).render("404", { message });
      }
      return res.render("sets", { sets: setsInTheme });
    } else {
      const allSets = await legoData.getAllSets();
      if (allSets.length === 0) {
        const message = "No sets found for any theme";
        return res.status(404).render("404", { message });
      }
      return res.render("sets", { sets: allSets });
    }
  } catch (err) {
    // If it's not a 404 situation, render the generic error view
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});


// GET "/lego/sets/:num"
app.get("/lego/sets/:num", async (req, res) => {
  try {
    const setId = req.params.num;
    const foundSet = await legoData.getSetByNum(setId);
    if (!foundSet) {
      res.status(404).render("404", { message: "No set found for the specified set number: " + setId });
      return;
    }
    res.render("set", { set: foundSet });
  } catch (error) {
    res.status(404).render("404", { message: "Error: Unable to find requested set" });
  }
});


// GET "/lego/addSet"
app.get('/lego/addSet', async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render('addSet', { themes });
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

// POST /lego/addSet
app.post('/lego/addSet', async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

// GET  "/lego/editSet/:num"
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    let themes = await legoData.getAllThemes();

    res.render("editSet", { set, themes });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

//  POST /lego/editSet
app.post("/lego/editSet", async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'am sorry, but we have encountered the following error ${err}` });
  }
});

// DELETE /lego/deleteSet/:num
app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

// Handles any routes that are not defined above
// 404 pages - not found - Always goes at the bottom
app.use((req, res, next) => {
  let message;

  // Check if the request was for a specific set number
  if (req.params.num) {
    message = "No sets found for the specified set number.";
  } else if (req.query.theme) {
    message = "No sets found for the specified theme.";
  } else {
    // Default 404 message
    message = "I'm sorry, we're unable to find what you're looking for.";
  }

  // Render the "404" view with the appropriate error message
  res.status(404).render("404", { message });
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`server listening on: ${HTTP_PORT}`);
  });
});
