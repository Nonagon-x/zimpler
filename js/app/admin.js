angular.module("admin", ['common', 'generic-modal', 'ngAnimate'])

.factory("propertiesPanel", ['$http', '$sce', function($http, $sce) {
	
	return {
		
		isOpen: false,
		scrollTop: 0,
		scrollMaxReached: false,
		panel: $(".n-properties-panel"),
		propertiesBody: $(".n-properties-panel .n-body"),
		widthClasses: "uk-width-1-1 uk-width-medium-2-3 uk-width-large-6-10",
		offset: $(".n-properties-panel").offset(),
		scope: null,
		
		open: function($scope, widthClasses) {
			
			if(widthClasses)
				this.widthClasses = widthClasses;
		
			this.isOpen = true;
			this.propertiesBody.scrollTop(0);
			this.scope = $scope;
			
			$this = this;
			
			var bodyScroll = function() {
				
				if($this.scope) {
					
					$this.scope.$apply(function() {
						
						var scrollBottom = 
							$this.propertiesBody.scrollTop() + 
							$this.propertiesBody.outerHeight();
						
						$this.scrollTop = $this.propertiesBody.scrollTop();
						$this.scrollMaxReached = scrollBottom >= $this.propertiesBody.prop("scrollHeight");
					});
				}
			};
			
			this.bodyScroll = bodyScroll;
			this.propertiesBody.on("scroll", bodyScroll);
			
			this.panel.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
				function(e) {
				
					$this.offsetLeft = $this.panel.offset().left;
					$this.scope.$apply();
				});
			
			setTimeout(function() {
				
				$this.propertiesBody.find(':input:visible:enabled:first').focus();
				
			}, 300);
			
			setTimeout(function() {
				
				bodyScroll();
				
			}, 1);
		},
		
		close: function() {
		
			this.isOpen = false;
			this.scope = null;
			this.offsetLeft = 0;
			
			this.scope.$apply();

			this.propertiesBody.off("scroll", this.bodyScroll);
		}
	};
	
}])

.controller('AdminController', function($scope, $locale) {
	
	var mainContentBody = $(".n-body .n-content");

	$scope.mainContentBodyScrollTop = 0;
	$scope.mainContentBodyScrollMaxReached = false;
	
	$(".n-body .n-content").on("scroll", function() {
		
		$scope.$apply(function() {
			
			var scrollBottom = mainContentBody.scrollTop() + mainContentBody.outerHeight();
			
			$scope.mainContentBodyScrollTop = mainContentBody.scrollTop();
			$scope.mainContentBodyScrollMaxReached = scrollBottom >= mainContentBody.prop("scrollHeight");
		});
	});
	
	$(function() {
		
		$("table").freezeHeader(); 
	});
});