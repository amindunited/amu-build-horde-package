
# amu-build-horde-package
A node script to build several projects and collate them into a single zip file for packaging

The resulting zip file will be named using the name from the package.json, and the major, minor, and buildNumbers, that are passed in via command arguments.
for example, in a project named 'my-project':
	
	$node build.js --major=1 --minor=2 --buildNumber=44
..will result in a zip file named:

my-project-1.2.44.zip

Configuration:

 - create a .buildHordePackage.conf.js
 - this file should export an object containing a 'projects' array, and a 'destination' path
 - each object in the projects array should contain:
 	- a 'src_directory': the directory that the project is in
 	- a 'destination_dir': the name of the directory that the project will be packaged as
 	- a 'build_command': the command that will be called to run the project's build
 	- a 'build_output_dir': the directory that the project's build can be found in (this is where the projects file will be copied from) 

an example config (.buildHordePackage.conf.js):

	module.exports.config = {
	  'projects' : [{
	    src_directory: './examples/simple_use/project_1',
	    destination_dir: 'project_1',
	    build_command: 'npm run build',
	    build_output_dir: 'dist'
	  },
	  {
	    src_directory: './examples/simple_use/project_2',
	    destination_dir: 'project_2',
	    build_command: 'npm run build',
	    build_output_dir: 'dist'
	  }],
	  'destination' : './package'
	};

use:

	//import the package into your code (see build.js):
	
	var AmuBuildHordePackage = require('./index.js');
	//The code runs on constructor:
	new AmuBuildHordePackage();

Run your code from the command line with major, minor, and buildNumber as flags:

	//now pass through the config arguments as command flags:
	$ node build.js --major=1 --minor=2 --buildNumber=14