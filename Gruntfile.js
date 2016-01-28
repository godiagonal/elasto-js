/*global module:false*/
module.exports = function (grunt) {

	// Helper methods
	function sub(str) {
		return str.replace(/%s/g, LIBRARY_NAME);
	}

	function wrapModules(head, tail) {
		return head.concat(MODULE_LIST).concat(tail);
	}

	var LIBRARY_NAME = 'elasto';

	// Modules to be included in the build
	var MODULE_LIST = [
      	sub('src/%s.easing.js'),
		sub('src/%s.jquery.js')
    ];

	// Gets inserted into dist version
	var DIST_HEAD_LIST = [
      	sub('src/%s.intro.js'),
		sub('src/%s.const.js'),
      	sub('src/%s.core.js')
    ];

	// This is the same as DIST_HEAD_LIST, just without *.const.js (which is just
	// there for UglifyJS conditional compilation).
	var DEV_HEAD_LIST = [
      	sub('src/%s.intro.js'),
      	sub('src/%s.core.js')
    ];

	var TAIL_LIST = [
      	sub('src/%s.init.js'),
      	sub('src/%s.outro.js')
    ];

	// Gets inserted at the top of the generated files in dist/.
	var BANNER = [
      	'/*! <%= pkg.name %> - v<%= pkg.version %> - ',
      	'<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author.name %> */\n'
    ].join('');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				options: {
					banner: BANNER
				},
				src: wrapModules(DIST_HEAD_LIST, TAIL_LIST),
				dest: sub('dist/%s.js')
			},
			dev: {
				options: {
					banner: BANNER
				},
				src: wrapModules(DEV_HEAD_LIST, TAIL_LIST),
				dest: sub('dist/%s.js')
			}
		},
		sass: {
			dist: {
				options: {
					style: 'compressed'
				},
				files: (function () {
					// Using an IIFE so that the destination property name can be
					// created dynamically with sub().
					var obj = {};
					obj[sub('dist/css/%s.min.css')] = [sub('src/sass/%s.scss')];
					return obj;
				}())
			},
			dev: {
				options: {
					style: 'expanded'
				},
				files: (function () {
					var obj = {};
					obj[sub('dist/css/%s.css')] = [sub('src/sass/%s.scss')];
					return obj;
				}())
			}
		},
		uglify: {
			dist: {
				files: (function () {
					var obj = {};
					obj[sub('dist/%s.min.js')] = [sub('dist/%s.js')];
					return obj;
				}())
			},
			options: {
				banner: BANNER
			}
		},
		jshint: {
			all_files: [
        		'grunt.js',
        		sub('src/%s.!(intro|outro|const)*.js')
      		],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		watch: {
			js: {
				files: ['src/*.js'],
				tasks: ['build-dev']
			},
			css: {
				files: ['src/sass/*.scss'],
				tasks: ['build-dev']
			}
		}
	});

	grunt.registerTask('default', [
      	'jshint',
      	'build'
    ]);

	grunt.registerTask('build', [
      	'build-dist',
      	'build-dev'
    ]);

	grunt.registerTask('build-dist', [
      	'concat:dist',
      	'uglify:dist',
		'sass:dist'
    ]);

	grunt.registerTask('build-dev', [
      	'concat:dev',
		'sass:dev'
    ]);

};