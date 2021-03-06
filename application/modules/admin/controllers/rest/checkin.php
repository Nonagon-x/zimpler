<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
	
/**
 * Zimpler
 *
 * An open source CMS for PHP 5.4 or newer
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
 * Zimpler Admin File REST Controller Class
 *
 * @package		Zimpler
 * @subpackage	Admin Module
 * @category	Libraries
 * @author		Chonnarong Hanyawongse
 * @link		http://zimpler.com/user_guide/admin/rest/file.html
 */

class Checkin extends REST_Controller {

    function __construct()
    {
        parent::__construct();

        $this->load->library('user/ion_auth');
		if(!$this->ion_auth->logged_in() || !$this->ion_auth->is_admin())
		{
			show_404();
		}
    }
    
    function index_get()
    {
		$this->response(TRUE);
    }
}