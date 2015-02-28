<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Zimpler
 *
 * An open source CMS for PHP 5.1.6 or newer
 *
 * @package		Zimpler
 * @author		Chonnarong Hanyawongse
 * @copyright	Copyright (c) 2008 - 2015, Nonagon, Ltd.
 * @license		http://zimpler.com/user_guide/license.html
 * @link		http://zimpler.com
 * @since		Version 0.1
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * Zimpler CMS Navigation REST Controller Class
 *
 * @package		Zimpler
 * @subpackage	CMS Module
 * @category	Libraries
 * @author		Chonnarong Hanyawongse
 * @link		http://zimpler.com/user_guide/cms/api/navigation.html
 */

class Navigation extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->load->model('navigation_model');
    }
    
    function item_post()
    {
	    $nav_item = array(
		    
		    'culture' => $this->post('culture'),
		    'target' => $this->post('target'),
		    'title' => $this->post('key'),
		    'url' => $this->post('url'),
		    'text' => $this->post('publicTitle')
		);
	    
	    $this->response($nav_item);
    }
    
    function publish_put($content_key, $culture)
    {
		$this->content_model->publish($content_key, $culture);
    }
    
    function revision_post($content_key, $culture)
    {
	    $this->content_model->create_new_revision($content_key, $culture);
    }
    
    function revision_delete($content_key, $culture, $revision)
    {
	    $this->content_model->delete_revision($content_key, $culture, $revision);
    }
}