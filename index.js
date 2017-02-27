"use strict";

var path = require('path');
var fs = require('fs');

const ROOT_DIR = process.cwd();
const CONFIG_FILENAME = '.buidHordePackage.conf.js';
const CONFIG = {};

class BuildHordePackage {

  constructor () {
    this.loadConfig();
  }

  /**
   * Search the ROOT_DIR for a .buidHordePackage.conf.js and load it
   * @return {Object} A config Object
   */
  loadConfig () {

    let filePath = path.join(ROOT_DIR, CONFIG_FILENAME);

    fs.stat(filePath, function (err, stats) {

      if (!err && stats.isFile() ) {

        Object.assign(CONFIG, require(filePath));
        console.log('updated config ', CONFIG);

      } else if (err) {

        console.warn('Build Horde Package could not find a config file. Using default config.');
        return CONFIG; // exit here since stats will be undefined

      } else {

        return new Error('Configuration Error');

      }
    });

  }

  runBuilds () {
    let projects = CONFIG.projects;
    proects.forEach((obj)=>{
      //...
      //should change the process to the directory for the project
      //...then run the build command
      //...then change back to root_dir
      //...copy the files fromt the source to the destination
    })
  }

}

new BuildHordePackage();