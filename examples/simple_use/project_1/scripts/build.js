"use strict";

const path = require('path');
const fs = require('fs-extra');

const BUILD_PATH = path.join(__dirname, '../dist');
const SRC_PATH = path.join(__dirname, '../src');

function build_destination_directory () {

  return new Promise(function (resolve, reject) {

    fs.lstat(BUILD_PATH, function(err, stat) {
      
      if (err) {
        
        console.warn('cannot find destination directory, will create it now');
        
        fs.mkdir(BUILD_PATH, function (err, stat) {
          if (err) {
            console.warn('Error Creating destination directory...exiting...');
            reject(err);
          } else {
            resolve(stat);
          }
        });

      } else {
        resolve(stat);
      }
    });

  });
}

build_destination_directory().then(function (data) {
  console.log('yay...', data);
  fs.copy(SRC_PATH, BUILD_PATH, function (err) {
    if (err) {
      console.log('error copying');
    }
    console.log('DONE');
  });
}, function (err) {
  console.log('boo', err);
})