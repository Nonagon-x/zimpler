<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$module_menu_items = array(

	array(
		'icon' => 'dot-circle-o',
		'path' => 'admin/cms/siteinfo',
		'name' => lang('cms_menu_siteinfo'),
		'link' => base_url('admin/cms/siteinfo')
	),

	array(
		'icon' => 'sitemap',
		'path' => 'admin/cms/navigations',
		'name' => lang('cms_menu_navigations'),
		'link' => base_url('admin/cms/navigations')
	),
	
	array(
		'icon' => 'th-large',
		'path' => 'admin/cms/designs',
		'name' => lang('cms_menu_designs'),
		'link' => base_url('admin/cms/designs')
	),
	
	array(
		'icon' => 'files-o',
		'path' => 'admin/cms/pages',
		'name' => lang('cms_menu_pages'),
		'link' => base_url('admin/cms/pages')
	),
	
	array(
		'icon' => 'file-text',
		'path' => 'admin/cms/contents',
		'name' => lang('cms_menu_contents'),
		'link' => base_url('admin/cms/contents')
	)

);