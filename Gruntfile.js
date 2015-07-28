module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      dev: {
        options: {
          port: 3000,
          hostname: '*',
          base: '.',
          open: true,
          livereload: true
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'scripts.js', 'editor/**/*.js', 'lib/**/*.js', 'templates/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint'],
      options: {
        debounceDelay: 500
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');


  //grunt.registerTask('default', ['jshint', 'connect:dev']);
  grunt.registerTask('default', ['connect:dev', 'watch']);

};
