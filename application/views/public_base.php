<!DOCTYPE html>
<html class="uk-height-1-1">
<html lang="<?php echo $lang_code?>">
<head>
	<meta charset="utf-8">
	<meta name="language" content="<?php echo $meta_language?>">
	<meta name="keywords" content="<?php echo $meta_keywords?>">
	<meta name="description" content="<?php echo $meta_description?>">

	<title><?php echo $title?></title>
	
	<link rel="icon" type="image/png" href="<?php 
		echo base_url('assets/favicon.png')
	?>"/>

	<link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/vendor.min.css')?>"/>
	<link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/common.css')?>"/>
	<link rel="stylesheet" type="text/css" href="<?php echo base_url('assets/css/public.css')?>"/>
	
	<?php
		$pages = explode('/', uri_string());
		
		if(count($pages) > 0)
		{
			$page = $pages[count($pages) - 1];
		}
		else
		{
			$page = null;
		}

		$css_include_list = array();
		$js_include_list = array();
		
		$page_accum = "";
		
		foreach($pages as $page)
		{
			$page_accum .= $page;
			
			$page_path = base_url('assets/css/public/' . $page_accum . '.css');
			$real_path = 'assets/css/public/' . $page_accum . '.css';
			
			if(file_exists(FCPATH.$real_path))
				array_push($css_include_list, $page_path);

			$page_path = base_url('js/app/public/' . $page_accum . '.js');
			$real_path = 'js/app/public/' . $page_accum . '.js';

			if(file_exists(FCPATH.$real_path))
				array_push($js_include_list, $page_path);
			
			$page_accum .= '/';
		}
	?>
	
	<?php foreach($css_include_list as $item) : ?>
	<link rel="stylesheet" type="text/css" href="<?php echo $item?>"/>
	<?php endforeach ?>
	
	<base href="<?php echo current_url() ?>/" />
</head>
<body ng-app="root">
	
	<?php $this->load->view("public/header") ?>

	<?php echo $content; ?>

	<?php $this->load->view("public/footer") ?>
	
	<script type="text/javascript" src="<?php echo base_url('js/vendor.min.js')?>"></script>
	<script type="text/javascript" src="<?php echo base_url('js/common.js')?>"></script>
	<script type="text/javascript" src="<?php echo base_url('js/app/modal.js')?>"></script>
	
	<?php foreach($js_include_list as $item) : ?>
	<script type="text/javascript" src="<?php echo $item?>"></script>
	<?php endforeach ?>
	
	<script type="text/javascript">
		angular.modularize("root");
	</script>
</body>
</html>