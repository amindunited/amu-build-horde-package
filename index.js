"use strict";

var path = require('path');
var fs = require('fs-extra');
var yazl = require('yazl');
var recursive = require('recursive-readdir');

const ROOT_DIR = process.cwd();
const CONFIG_FILENAME = '.buidHordePackage.conf.js';
const CONFIG = {};

var destination_file_name = 'output';
var major_vers: 0;
var minor_vers: 0;
var patch_vers: 1;

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
        this.runBuilds()
        .then(() => {
          this.make_zip()
          .then(() => {
            console.log('should call clean up', this);
          });
        });

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
    let promise = new Promise((resolve, reject) => {
      
      this.build_destination_directory(CONFIG.destination).then(()=> {
      
        projects.forEach((obj, index, arr) => {
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
          fs.copy(obj.src_directory+'/'+obj.build_output_dir, CONFIG.destination + '/' + obj.destination_dir, (err) => {
            console.log('fs.copy ', err, __dirname);
            if (!err) {
              console.log('arr check', index, '===', arr.length);
              if ( index === (arr.length - 1) ) {
                console.log('should be the last one');
                resolve();
              }
            }
          });
        });
      });
    });

    return promise;

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

  make_zip () {
    return new Promise(function (resolve, reject) {
      let projects = CONFIG.projects;
      process.chdir(ROOT_DIR);
      console.log('make_zip', __dirname);
      recursive(__dirname + CONFIG.destination.replace('./', '/'), function (err, files) {
        if (err) { return reject(err); }
        // Files is an array of filename 
        console.log('recursive ', files);
        var zipfile = new yazl.ZipFile();

        files.forEach((obj) => {
          var packPath = CONFIG.destination.replace('./', '/');
          var outputPath = obj.replace(__dirname, '');
          outputPath = outputPath.replace(packPath, '');
          outputPath = outputPath.replace(/^\//, '');

          console.log('obj', obj, __dirname, outputPath, CONFIG.destination.replace('./', '/'), packPath);
          zipfile.addFile(obj, outputPath, '');
        });

        zipfile.outputStream.pipe(fs.createWriteStream("output.zip")).on("close", function(err) {
          if (err) { return reject(err); }
          console.log("done");
          return resolve();
        });

        zipfile.end();

      });

    });

  }

  cleanUp () {

  }

}


new BuildHordePackage();