# AMU Build Horde Package

A Repo for experimental UI projects in the Auspost domain.


It uses a node script to build several projects and collate them into a single zip file for packaging

## Versioning 
The resulting zip file will be named using the __'name' from the package.json__, and the __major, minor, and buildNumbers__, that are passed in via __command line arguments__.

for example, in a project named 'my-project':
	
	$node build.js --major=1 --minor=2 --buildNumber=44
...will result in a zip file named:

my-project-1.2.44.zip

## Configuration

 - Edit or create a file named 'build.conf.js'
 - this file should export an object containing a 'projects' array, and a 'destination' path
 - each object in the projects array should contain:
 	- a 'src_directory': the directory that the project is in
 	- a 'destination_dir': the name of the directory that the project will be packaged as
 	- a 'build_command': the command that will be called to run the project's build
 	- a 'build_ output _dir': the directory that the project's build can be found in (this is where the projects file will be copied from) 

an example config (build.conf.js):

	module.exports.config = {
		'projects' : [{
    		'src_directory': './apps/default',//the directory that the project is in
    		'build_command': 'npm install && npm run build',//the command that will be run to build the project
    		'build_output_dir': 'dist',//the directory where the results of the build can be found (relative to the src_directory)
    		'destination_dir': ''//the directory name for the final output of this project
  		}],  
  		'tmp_dir' : './tmp'
	};

## Import and init in index.js
**this is already done 

	//import the package into your code (see build.js):
	var BuildPackages = require('./build.js');

	var buildRunner = new BuildPackages();

	buildRunner.startBuilds();

## Running the build
Run your code from the command line with major, minor, and buildNumber as flags:

	//now pass through the config arguments as command flags:
	$ node index.js --major=1 --minor=2 --buildNumber=14