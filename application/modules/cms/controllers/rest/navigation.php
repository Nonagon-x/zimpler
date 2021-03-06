<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
	
require_once FCPATH . '/vendor/athari/yalinqo/YaLinqo/Linq.php';
use \YaLinqo\Enumerable;

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
 * Zimpler CMS Navigation REST Controller Class
 *
 * @package		Zimpler
 * @subpackage	CMS Module
 * @category	Libraries
 * @author		Chonnarong Hanyawongse
 * @link		http://zimpler.com/user_guide/cms/rest/navigation.html
 */

class Navigation extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        
        $this->load->model('navigation_model');
        $this->load->library('user/ion_auth');

		if(!$this->ion_auth->logged_in() || !$this->ion_auth->is_admin())
		{
			show_404();
		}
    }
    
    function index_get()
    {
	    $top_rev = $this->navigation_model->get_top_revision();
	    
	    $result = array(
		    'rev' => $top_rev,
		    'status' => $this->navigation_model->get_status($top_rev)
		);
		
		$this->response($result);
    }

    function index_delete()
    {
    	$result = $this->navigation_model->delete_top_revision();

	    $result = array(
		    'rev' => $result->revision,
		    'status' => $result->status
		);

    	$this->response($result);
    }
    
    function publish_post()
    {
	    $result = $this->navigation_model->publish();
	    $this->response($result);
    }
    
    function new_post()
    {
	    $result = $this->navigation_model->create_new_revision();
	    $this->response($result);
    }
    
    function list_get()
    {
	    $culture = $this->get('culture');
	    $parent_id = $this->get('parent');
	    
	    $nav_items = $this->navigation_model->get($culture, $parent_id);
	    
	    $nav_items = from($nav_items)->select(function($nav_item) {
		    
		    return Navigation::get_front_nav_item($nav_item);
		    
	    })->toArray();
	    
	    $this->response($nav_items);
    }
    
    function item_get()
    {
	    $id = $this->get('id');
	    $culture = $this->get('culture');
	    
	    $nav_item = $this->navigation_model->get_item($id, $culture);
	    
	    $this->response(Navigation::get_front_nav_item($nav_item));
    }
    
    function item_post()
    {
	    $target = $this->post('target');
	    $targetKey = $this->post('targetKey');
	    $parent = $this->post('parent');
	    
	    switch($target)
	    {
		    case 'normal': 
		    	$target = '_self';
		    	break;
		    	
		    case 'new':
		    	if($targetKey) $target = $targetKey;
		    	else $target = '_blank';
		    	break;
	    }
	    
	    $nav_item = array(
		    
		    'parent_id' => $this->post('parent'),
		    'title' => $this->post('title'),
		    'url' => $this->post('url'),
		    'target' => $target,
		    'label' => array(
			    
				'culture' => $this->post('culture'),
				'text' => $this->post('publicTitle')
		    )
		);
		
		$nav_item = $this->navigation_model->add_item($nav_item);
		$nav_item = Navigation::get_front_nav_item($nav_item);
	    
	    $this->response($nav_item);
    }
    
    function item_put()
    {
	    $id = $this->put('id');
	    $target = $this->put('target');
	    $targetKey = $this->put('targetKey');
	    
	    switch($target)
	    {
		    case 'normal': 
		    	$target = '_self';
		    	break;
		    	
		    case 'new':
		    	if($targetKey) $target = $targetKey;
		    	else $target = '_blank';
		    	break;
	    }
	    
	    $nav_item = array(
		    
		    'nav_item_id' => $id,
		    'parent_id' => $this->post('parent'),
		    'title' => $this->put('title'),
		    'url' => $this->put('url'),
		    'target' => $target,
		    'label' => array(
			    
				'culture' => $this->put('culture'),
				'text' => $this->put('publicTitle')
		    )
		);
		
		$nav_item = $this->navigation_model->update_item($nav_item);
		$nav_item = Navigation::get_front_nav_item($nav_item);
	    
	    $this->response($nav_item);
    }

    function item_delete($nav_item_id)
    {
    	$nav_item = $this->navigation_model->delete_item($nav_item_id);
    	$nav_item = array('id' => $nav_item->nav_item_id);

    	$this->response($nav_item);
    }
    
    function tree_post()
    {
	    $tree = json_decode($this->post("tree"));
	    $this->navigation_model->update_tree($tree);
    }
        
    public static function get_front_nav_item($nav_item)
    {
	    $nav_item = json_decode(json_encode($nav_item), FALSE);
	    
	    $target = $nav_item->target;
	    $targetKey = '';
	    
	    switch($target)
	    {
		    case '_self':
				$target = 'normal';
				break;
				
			case '_blank':
				$target = 'new';
				$targetKey = '';
				break;
				
			default:
			
				$target = 'new';
				$targetKey = $target;
				break;
	    }

	    $obj = new StdClass();
	    $obj->id = $nav_item->nav_item_id;
	    $obj->culture = $nav_item->culture;
	    $obj->parent = $nav_item->parent_id;
	    $obj->title = $nav_item->title;
	    $obj->url = $nav_item->url;
	    $obj->target = $target;
	    $obj->targetKey = $targetKey;
	    $obj->publicTitle = $nav_item->text;
	    
	    return $obj;
    }
}