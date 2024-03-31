// const setData = require("../data/setData");    No longer needed to read JSON Files
// const themeData = require("../data/themeData");
// let sets = [];  No longer needed


require("dotenv").config(); // Allows us to access the environment variables defined in .env file via process.env.DB_USER ...

const Sequelize = require("sequelize");
// set up sequelize to point to our postgres database
let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// Sequelize authenticate() and tell me if i was succesfully connected to my  DB or not!
sequelize
  .authenticate()
  .then(() => { console.log(`connection successful`) })
  .catch((err) => { console.log(`connection failed`) });


// Define the Theme model (table)
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);

// Define the Set model(table)
const Set = sequelize.define("Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);

// Create the association between Set and Theme
Set.belongsTo(Theme, { foreignKey: "theme_id" });


/* Utilizes an async function to handle the asynchronous sequelize.sync() operation.
The function returns a Promise that resolves if sequelize.sync() executes successfully, 
and rejects with the error message if it encounters an error. */
// initialize 
function initialize() {
  return new Promise(async(resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

/* Uses an async function to await the result of Set.findAll({ include: [Theme] }), 
which retrieves all sets from the database along with their associated themes.
Resolves the returned Promise with the retrieved sets. */
// getAllSets : SELECT * FROM sets
function getAllSets() {
  return new Promise(async(resolve, reject) => {
    let sets = await Set.findAll({ include: [Theme] })
    resolve(sets);
  });
}

// getSetByNum : SELECT (...column names) FROM sets where set_num = setNum
function getSetByNum(setNum) {
  return new Promise(async(resolve, reject) => {
    let foundSet = await Set.findAll({ include: [Theme], where: { set_num: setNum } });
    if (foundSet.length > 0) {
      resolve(foundSet[0]);
    } else {
      reject("Unable to find requested set");
    }
  });
}

// SELECT  * FROM Sets WHERE theme_id = theme
function getSetsByTheme(theme) {
  return new Promise(async (resolve, reject) => {
    try {
      // Find all sets where the associated theme's name contains the provided theme string
      const foundSets = await Set.findAll({
        include: [Theme],
        where: {
          '$Theme.name$': {
            [Sequelize.Op.iLike]: `%${theme}%`
          }
        }
      });

      // Check if any sets were found
      if (foundSets.length > 0) {
        resolve(foundSets);
      } else {
        reject("Unable to find requested sets");
      }
    } catch (error) {
      reject(error.message); // Reject with error message if an error occurs
    }
  });
}

// addSet : INSERT INTO sets (...table names) VALUES (...params) 
async function addSet(setData) {
  try {
    // Create a new set using the Set model and the provided data
    await Set.create(setData);
    // If the set creation is successful, resolve the Promise
    return Promise.resolve();
  } catch (err) {
    // If there was an error during set creation, reject the Promise with an appropriate error message
    return Promise.reject(err.errors[0].message);
  }
}

// getAllThemes : SELECT themes FROM themes
async function getAllThemes() {
  try {
    // Retrieve all themes from the Theme model
    const themes = await Theme.findAll();
    // Resolve the Promise with the retrieved themes
    return Promise.resolve(themes);
  } catch (err) {
    // If there was an error, reject the Promise with the error message
    return Promise.reject(err.message);
  }
}

// editSet : UPDATE sets SET ... WHERE set_num = setNum
async function editSet(setNum, setData) {
  try {
    await Set.update(setData, { where: { set_num: setNum } });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err.errors[0].message);
  }
}


// deleteSet : DELETE FROM SETS WHERE set_num = set_num
async function deleteSet(set_num) {
  try {
    await Set.destroy({
      where: { set_num: set_num }
    });

  } catch (err) {
    console.error(err.errors[0].message);

  }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet};













// // Code Snippet to insert existing data from Set / Themes
// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);
//       // NOTE: If you receive the error:
//       // insert or update on table "Sets" violates foreign key constraint //"Sets_theme_id_fkey"
//       // it is because you have a "set" in your collection that has a "theme_id" that //does not exist in the "themeData".   
//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, //fix the error in your .json files and re-run this code
//     }
//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });