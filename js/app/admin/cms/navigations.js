angular.module("cms-siteinfo", ['common', 'generic-modal', 'admin', 'ngAnimate'])

.directive('nHorzStack', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			
			var left = attrs.nHorzStack * $(elem).outerWidth();
			
			if(left == 0) {
				$(elem).css("left", "1px");
			} else {
				$(elem).css("left", left + "px");
			}
			
			var length = $(".n-columns-view").children().length;
			$(".n-columns-view").children().each(function(i, e) {
				
				$(e).css("z-index", length - i);
			});
		}
	}
})

.controller("CmsNavigationController", 
	['$scope', '$rootScope', '$window', 'submitForm', 'checkFormDirty', 'propertiesPanel',
	function($scope, $rootScope, $window, submitForm, checkFormDirty, propertiesPanel) {
	
	$scope.editingData = null;
	$scope.propertiesPanel = propertiesPanel;
	
	$scope.levels = [{ 
		number: 1,
		items: [{
			
			key: 'Home',
			name: 'Home',
			url: ''
		}]
	}];
	
	$scope.sortableOptions = {
		
		placeholder: "n-item",
		connectWith: ".n-items",
		cancel: ".n-drilling-down",
		start: function(e, ui) {
			
			$(".n-column").css("z-index", 0);
			$(".n-column .n-items").css("overflow-y", "visible");
			
			$(e.target).css("z-index", 2);
			$(e.target).parent().css("z-index", 1);
		},
		stop: function(e, ui) {
			
			$(e.target).css("z-index", 0);
			
			var length = $(".n-columns-view").children().length;
			$(".n-columns-view").children().each(function(i, elem) {
				
				$(elem).css("z-index", length - i);
				$(elem).find(".n-items").css("overflow-y", "auto");
			});
		},
		update: function() {
			
			console.debug($scope.levels);
		}
	};
	
	$scope.addItem = function(level) {
		
		$scope.propertiesPanel.open($scope);
	};
	
	$scope.edit = function(item) {
		
		$scope.editingData = item;
	}
	
	$scope.expand = function(level, item, event) {
		
		event.stopPropagation();
		
		for(var i=0; i<level.items.length; i++)
			level.items[i].expanded = false;
		
		item.expanded = true;
		
		// Slice all other levels off.
		$scope.levels = $scope.levels.slice(0, level.number);
		$scope.levels.push({
			number: level.number + 1,
			items: []
		});
	}

	$scope.collapse = function(level, item, event) {
		
		event.stopPropagation();
		
		// Slice all other levels off.
		$scope.levels = $scope.levels.slice(0, level.number);
		item.expanded = false;
		
		setTimeout(function() {
			$(".n-columns-view").children().each(function(i, e) {
				
				if($(e).hasClass("ng-leave")) {
					
					var percent = -100 * (i);
					
					$(e).css("-webkit-transform", "translate(" + percent + "%, 0)");
					$(e).css("-moz-transform", "translate(" + percent + "%, 0)");
					$(e).css("-ms-transform", "translate(" + percent + "%, 0)");
					$(e).css("-o-transform", "translate(" + percent + "%, 0)");
					$(e).css("transform", "translate(" + percent + "%, 0)");
				}
			});
		}, 10);
	}
	
	$scope.save = function() {
		
		var culture = $("#cultureSelection").val();
		$scope.editingData.culture = culture;
		
		submitForm($scope, "mainForm", "").
			success(function(data, status, headers, config) {
				
				$scope.originalData = angular.copy($scope.editingData);
				
				$scope.mainForm.$setPristine(); 
				$scope.mainForm.$setUntouched();
				
				UIkit.notify("<i class='uk-icon-check'></i> " + 
					$scope.successMessage, { status: "success", timeout: 1000, pos: "top-right" });
			});
	}
	
	$scope.cancel = function() {
		
		checkFormDirty($scope, "mainForm").confirm(function() {
			
			$scope.editingData = angular.copy($scope.originalData);
			
			$scope.mainForm.$setPristine(); 
			$scope.mainForm.$setUntouched();
		});
	}
	
	$scope.$on('init', function(event, args) {
		
		$scope.originalData = angular.copy($scope.editingData);
	});
	
	var selectedCulture = $("#cultureSelection").val();
	$("#cultureSelection").on("change", function() {
		
		$window.location.href = $scope.baseUrl + "?culture=" + $(this).val();
		$("#cultureSelection").val(selectedCulture);
	});
	
}]);