/**
 * Run tests with coverage using mocha and istanbul.
 *
 * ---------------------------------------------------------------
 */
module.exports = function (grunt) {

  grunt.config.set('mocha_istanbul', {
    coverage: {
      src:     './test/**/*.spec.js', // the folder, not the files
      options: {
        coverage:       true,
        coverageFolder: './coverage',
        root:           './api',
        reporter:       'spec',
        mochaOptions:   ['--require ./test/helpers.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-istanbul');
};
