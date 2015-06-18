module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	// Project configuration.
	grunt.initConfig({

		copy: {

			main: {
			    files: [

			    	{
			    		expand: true,
			    		cwd: 'bower_components/tinymce-dist/',
			    		src: ['**'],
			    		dest: 'js/lib/tinymce/'

			    	}, {

			    		expand: true,
			    		cwd: 'bower_components/codemirror/',
			    		src: ['**'],
			    		dest: 'js/lib/codemirror/'
			    		
			    	}
			    ]
			}
		},

		uglify: {
			my_target: {
				files: {
					'js/vendor.min.js': [
						'bower_components/jquery/dist/jquery.min.js', 
						'bower_components/jquery-ui/jquery-ui.min.js', 
						'bower_components/uikit/js/uikit.min.js',
						'bower_components/uikit/js/components/form-select.min.js',
						'bower_components/intl-tel-input/build/js/intlTelInput.min.js',
						'bower_components/angular/angular.min.js',
						'bower_components/angular-animate/angular-animate.min.js',
						'bower_components/angular-intl-tel/angular-intl-tel.js',
						'bower_components/angular-validation-match/dist/angular-input-match.min.js',
						'bower_components/angular-modularizer/angular-modularizer.js',
						'bower_components/angular-ui-sortable/sortable.min.js',
						'bower_components/angular-gridster/dist/angular-gridster.min.js',
						'bower_components/freezeh/freezeh.js',
						'bower_components/lodash/lodash.min.js',
						'bower_components/uikit/js/components/notify.min.js',
						'bower_components/uikit/js/components/tooltip.min.js',
						'bower_components/uikit/js/components/pagination.min.js',
						'bower_components/uikit/js/components/grid.min.js',
						'bower_components/javascript-detect-element-resize/jquery.resize.js',
						'bower_components/ng-file-upload/ng-file-upload.min.js'],
						
					'js/lib/libphonenumber.js': [
						'bower_components/intl-tel-input/lib/libphonenumber/build/utils.js'],

					'js/lib/ui-codemirror.min.js': [
						'bower_components/codemirror/mode/markdown/markdown.js',
						'bower_components/codemirror/addon/mode/overlay.js',
						'bower_components/codemirror/mode/xml/xml.js',
						'bower_components/codemirror/mode/gfm/gfm.js',
						'bower_components/codemirror/mode/javascript/javascript.js',
						'bower_components/codemirror/mode/css/css.js',
						'bower_components/codemirror/mode/htmlmixed/htmlmixed.js',
						'bower_components/angular-ui-codemirror/ui-codemirror.js'],

					'js/lib/ui-tinymce.min.js': [
						'bower_components/angular-ui-tinymce/src/tinymce.js'
					]
				}
			}
		},
		
		cssmin: {
			target: {
				files: {
					'assets/css/vendor.min.css': [
						'bower_components/uikit/css/uikit.almost-flat.min.css',
						'bower_components/codemirror/lib/codemirror.css',
						'bower_components/uikit/css/components/form-select.almost-flat.min.css',
						'bower_components/uikit/css/components/form-advanced.almost-flat.min.css',
						'bower_components/uikit/css/components/htmleditor.almost-flat.min.css',
						'bower_components/uikit/css/components/notify.almost-flat.min.css',
						'bower_components/uikit/css/components/tooltip.almost-flat.min.css',
						'bower_components/intl-tel-input/build/css/intlTelInput.css',
						'bower_components/codemirror/lib/codemirror.css',
						'bower_components/angular-gridster/dist/angular-gridster.min.css',
						'bower_components/codemirror/theme/zenburn.css']
				}
			}
		}
	});
};