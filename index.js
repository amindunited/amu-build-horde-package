"use strict";

var path = require('path');
var fs = require('fs-extra');

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

    fs.stat(filePath, (err, stats) => {

      if (!err && stats.isFile() ) {

        Object.assign(CONFIG, require(filePath).config);
        console.log('updated config ', CONFIG);
        this.runBuilds();

      } else if (err) {

        console.warn('Build Horde Package could not find a config file. Using default config.');
        return CONFIG; // exit here since stats will be undefined

      } else {

        return new Error('Configuration Error', err);

      }
    });

  }

  runBuilds () {
    let projects = CONFIG.projects;
    console.log('config', CONFIG);
    this.build_destination_directory('./projects/').then(()=> {
      projects.forEach((obj) => {
        console.log('project for each', obj);
        //...
        //should change the process to the directory for the project
        process.chdir(obj.src_directory);

        //split up the commands into an array
        var args = obj.build_command.split(' ');

        //shift the cmd from the front of the array
        var cmd = args.shift();

        //...then run the build command, with the args array
        var spawn = require('child_process').spawn;
        var exe = spawn( cmd, args );

        //...then change back to root_dir
        process.chdir(__dirname);

        //...copy the files from the source to the destination
        fs.copy(obj.src_directory+'/'+obj.build_output_dir, './projects/'+obj.destination_dir, (err) => {
          console.log('fs.copy ', err, __dirname);
        });

      });

    });
  }

  build_destination_directory (dir_path) {

    return new Promise(function (resolve, reject) {

      fs.lstat(dir_path, function(err, stat) {
        
        if (err) {
          
          console.warn('cannot find destination directory, will create it now');
          
          fs.mkdir(dir_path, function (err, stat) {
            if (err) {
              console.warn('Error Creating destination directory...exiting...', err);
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

}

new BuildHordePackage();