<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Cms_admin extends MX_Controller {

	function __construct()
	{
		parent::__construct();
	}

	function general()
	{
		echo "This is general admin";
	}

	function navigations()
	{
		echo "This is navigations admin";
	}

	function pages()
	{
		echo "This is pages admin";
	}

	function contents()
	{
		echo "This is contents admin";
	}
}