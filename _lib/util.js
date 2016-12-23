"use strict";

// const log = require('./logger')(__filename);

module.exports.setUserCountries = function(users, countriesGroup) {
  let size = Object.keys(users).length;
  let countries = countriesGroup[size];

  if(countries && 10 >= size && size >= 5){
    Object.keys(users).forEach(function(user, index) {
      let group = index + 1;
      users[user]["countries"] = countries["group_" + group];
      users[user]["locked"] = true;
    });
    return true;
  }
  return false;
}

module.exports.validatePassword = function(countries, password) {
  return Object.keys(countries).some(function(code) {
    return password.indexOf(code) !== -1;
  });
}
