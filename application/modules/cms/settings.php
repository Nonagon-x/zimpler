<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$module_setting_panels = array(

	array(
		'view' => 'cms/cms_settings',
		'load' => function($ci) {

			$ci->load->model('cms/settings_model');
			return $ci->settings_model->load_settings();
		},
		'save' => function($ci) {

			$languages = $ci->input->post('cms_enabled_languages');
			$languages = json_decode($languages);

			$default_language = $ci->input->post('defaultLanguage');

			$ci->load->model('cms/settings_model');
			return $ci->settings_model->save_settings($languages, $default_language);
		}
	)
);