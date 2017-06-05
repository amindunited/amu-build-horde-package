module.exports.config = {
  'projects' : [{
    src_directory: './examples/simple_use/project_1',//the directory that the project is in
    build_command: 'npm run build',//the command that will be run to build the project
    build_output_dir: 'dist',//the directory where the results of the build can be found (relative to the src_directory)
    destination_dir: 'project_1',//the directory name for the final output of this project
  },
  {
    src_directory: './examples/simple_use/project_2',
    destination_dir: 'project_2',
    build_command: 'npm run build',
    build_output_dir: 'dist'
  }],
  'tmp_dir' : './tmp'
};