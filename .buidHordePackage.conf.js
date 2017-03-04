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