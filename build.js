"use strict";

const path = require('path');
const fs = require('fs-extra');
const yazl = require('yazl');
const recursive = require('recursive-readdir');

const ROOT_DIR = process.cwd();
const CONFIG_FILENAME = 'build.config.js';
const CONFIG = {};

const _package = require(ROOT_DIR + '/package.json');


class BuildPackages {

  /** these will be set by the get args method...

    this.major = '';
    this.minor = '';
    this.buildNumber = '';
  */

  constructor () {
    this.getArgs();
  }

  runBuilds() {
    this.loadConfig()
    .then(() => {
      this.runBuilds()
      .then(()=>{
        this.make_zip()
        .then(()=>{
          this.cleanUp()
          .then(()=>{
            console.log('Build Package Done.');
          });
        });
      });
    });
  }

  getArgs () {
    //The first 2 objects in the array are the env, and script...we don't need those
    let args = process.argv.splice(2);

    //major, minor, buildNumber
    args.forEach((obj) => {
      let keyVal = obj.split('=');
      let key = keyVal[0].replace('--', '');
      let val = keyVal[1];
      this[key] = val;
    });

  }

  /**
   * Search the ROOT_DIR for a .buidHordePackage.conf.js and load it
   * @return {Object} A config Object
   */
  loadConfig () {

    let promise = new Promise((resolve, reject) => {

      let filePath = path.join(ROOT_DIR, CONFIG_FILENAME);

      fs.stat(filePath, (err, stats) => {

        if (!err && stats.isFile() ) {

          Object.assign(CONFIG, require(filePath).config);

          resolve(CONFIG);
 
        } else if (err) {

          console.warn('Build Horde Package could not find a config file. Using default config.');
          reject(CONFIG);

        } else {
          reject(err);
        }
      });
    });

    return promise;

  }

  /**
   * Run the build scripts for each configured project and copy the result to the destination directory
   * @return {promise}
   */
  runBuilds () {

    let projects = CONFIG.projects;
    let promise = new Promise((resolve, reject) => {
      
      this.build_destination_directory(CONFIG.tmp_dir).then(()=> {

        projects.forEach((obj, index, arr) => {
          //...
          //should change the process to the directory for the project
          process.chdir(obj.src_directory);

          //split up the commands into an array
          var args = obj.build_command.split(' ');

          //shift the cmd from the front of the array
          var cmd = args.shift();

          //...then run the build command, with the args array
          var spawn = require('child_process').spawn;

          var exe = spawn( cmd, args, {
            shell: true
          });
          exe.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          exe.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
          });
          exe.on('close', (err) => {
            console.log('on close ? ', err);
            this.copyBuildToDestination(obj, index === (arr.length - 1))
            .then(() => {
              resolve();
            }, (err) => {
              reject(err);
            });
          });

          //...then change back to root_dir
          process.chdir(ROOT_DIR);

        });
      });
    });

    return promise;

  }

  /**
   * [copyBuildToDestination description]
   * @param  {Object}  configObj - the config object for this child project
   * @param  {Boolean} shouldResolve - if the promise should resolve
   * @return {Promise}
   */
  copyBuildToDestination (configObj, shouldResolve) {

    if ( shouldResolve === null || shouldResolve === undefined ) {
      shouldResolve = true;
    }

    var promise = new Promise((resolve, reject) => {
      // be sure that we are in the root_dir
      process.chdir(ROOT_DIR);
      console.log('in copy...');
      //...copy the files from the source to the destination
      fs.copy(configObj.src_directory+'/'+configObj.build_output_dir, CONFIG.tmp_dir + '/' + configObj.destination_dir, (err) => {

        if (!err) {
          if ( shouldResolve ) {
            resolve();
          }
        } else {
          reject(err);
        }

      });

    });
    return promise;
  }


  /**
   * Create destination directory (if needed)
   * @param  {string} dir_path - the RELATIVE path to create
   * @return {promise}
   */
  build_destination_directory (dir_path) {

    return new Promise((resolve, reject) => {

      fs.lstat(dir_path, (err, stat) => {

        if (err) {

          fs.mkdir(dir_path, (err, stat) => {
            if (err) {

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

  /**
   * Make a zip file containing all the projects' results  
   * @return {promise}
   */
  make_zip () {
    return new Promise((resolve, reject) => {

      let projects = CONFIG.projects;
      let zipName = ``;

      process.chdir(ROOT_DIR);

      recursive(ROOT_DIR + CONFIG.tmp_dir.replace('./', '/'), (err, files) => {

        if (err) { return reject(err); }

        // Files is an array of filenames
        var zipfile = new yazl.ZipFile();

        files.forEach((obj) => {
          var packPath = CONFIG.tmp_dir.replace('./', '/');
          var outputPath = obj.replace(ROOT_DIR, '');
          outputPath = outputPath.replace(packPath, '');
          outputPath = outputPath.replace(/^\//, '');

          zipfile.addFile(obj, outputPath, '');

        });

        var zipName = _package.name + '-' + this.major + '.' + this.minor + '.' + this.buildNumber + '.zip';

        zipfile.outputStream.pipe(fs.createWriteStream(zipName)).on("close", function(err) {
          if (err) { return reject(err); }
          return resolve();
        });

        zipfile.end();

      });

    });

  }

  /**
   * Delete the destination directory
   * @return {promise}
   */
  cleanUp () {

    var promise = new Promise((resolve, reject) => {

      process.chdir(ROOT_DIR);

      fs.lstat(CONFIG.tmp_dir, function(err, stat) {

        if (!err) {

          fs.remove(CONFIG.tmp_dir, function (err, stat) {
            if (err) {

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

    return promise;
  }

}

module.exports = BuildPackages;