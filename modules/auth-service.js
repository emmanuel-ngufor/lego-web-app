const bcrypt = require("bcryptjs");    // Import bcryptjs module
const mongoose = require("mongoose");  // require the mongoose module
let Schema = mongoose.Schema;          // variable to hold the schema object, which is a class for defining the structure of the model
require("dotenv").config();            // load environment variables from the .env file via process.env

// Defining the user model
let userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User; // To be defined on new connection (see initialize)

/* initialize()
This initialize function ensures that we establish a connection to our MongoDB instance using the provided connection string from the .env file.
It initializes the User object once the connection is successfully established and resolves the promise.
If there's an error during the connection process, it rejects the promise with the provided error message. */
function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

// registerUser
function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password == userData.password2) {
      bcrypt.hash(userData.password, 10).then((hash) => {
        userData.password = hash;
        let newUser = new User(userData);
        newUser
          .save()
          .then(() => {
            resolve();
          })
          .catch((err) => {
            if ((err.code = 11000)) {
              reject("User Name already taken");
            } else {
              reject("There was an error creating the user: " + err);
            }
          })
          .catch((err) => {
            reject("There was an error encrypting the password");
          });
      });
    } else {
      reject("Passwords do not match");
    }
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length == 0) {
          // .length is used for both checking array and string size.
          reject("Unable to find user: " + userData.userName);
        } else {
          // while .find userName:userData.userName return unique value of users,
          // .find always return with array. Due to that, when we use .find, we have to specify the first unique data with users[0]
          // others [1][2] and so on are empty.
          bcrypt.compare(userData.password, users[0].password).then((res) => {
            //(users.password !== bcrypt.hash(userData.password)) not this. use compare method
            if (res == true) {
              // .compare method return bool
              if (users[0].loginHistory.length == 8) {
                users[0].loginHistory.pop(); // remove the last elem from the array
              }
              users[0].loginHistory.unshift({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              }); //add elem in the begging of array. adjust the length as well
              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject("There was an error verifying the user: " + err);
                });
            } else {
              reject("Incorrect Password for user: " + userData.userName);
            }
          });
        }
      })
      .catch((err) => {
        reject("Unable to find user: " + userData.userName);
      });
  });
}

// Export the functions
module.exports = { initialize, registerUser, checkUser };
