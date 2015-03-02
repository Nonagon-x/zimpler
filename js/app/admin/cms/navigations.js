angular.module("cms-siteinfo", ['common', 'generic-modal', 'admin', 'ngAnimate'])

.config(function($locationProvider) {
	
	$locationProvider.html5Mode(true).hashPrefix('?');
})

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
	['$scope', '$rootScope', '$window', '$location', 'submitForm', 'checkFormDirty', 'propertiesPanel', 'httpEx',
	function($scope, $rootScope, $window, $location, submitForm, checkFormDirty, propertiesPanel, httpEx) {
		
	$scope.restBaseUrl = null;
	$scope.editingData = null;
	$scope.editingLevel = 0;
	$scope.propertiesPanel = propertiesPanel;
	$scope.lastOrganizePendingUpdateTimeout = null;
	
	$scope.currentRevision = 1;
	$scope.currentCulture = $location.search().culture || "en-us";
	
	$scope.levels = [];
		
	$scope.sortableOptions = {
		
		placeholder: "n-item",
		appendTo: ".n-columns-view",
		helper: function(e, ui) { 
			
			var elem = ui.clone();
			elem.css("border", "1px solid #ccc");
			elem.css("opacity", 0.5);
			
			return elem;
		},
		connectWith: ".n-items",
		cancel: ".n-drilling-down",
		start: function(e, ui) {
			
			$(".n-column").css("z-index", 0);
			$(e.target).parent().css("z-index", 1);
			
			var scrollTop = $(e.target).prop("recordedScrollTop") || 0;
			$(e.target).scrollTop(scrollTop);
		},
		stop: function(e, ui) {
			
			$(e.target).css("z-index", 0);
			
			var length = $(".n-columns-view").children().length;
			$(".n-columns-view").children().each(function(i, elem) {
				
				$(elem).css("z-index", length - i);
			});
		},
		update: function(e, ui) {
			
			$scope.updateTree(e, ui);
		}
	};
	
	$scope.refresh = function() {
		
		$scope.levels = [];
		
		httpEx($scope, "GET", $scope.restBaseUrl + "/items", { 
			
			culture: $scope.currentCulture, 
			parent: 0 
			
		}).success(function(data, status, headers, config) {
			
			$scope.levels.push({
				number: $scope.levels.length + 1,
				parent: 0,
				items: data
			});
		});
	}
	
	$scope.addItem = function(level) {
		
		$scope.editingLevel = level;
		
		$scope.editingData = {
			
			parent: $scope.levels[$scope.editingLevel].parent,
			revision: $scope.currentRevision,
			headerTitle: "New Item",
			culture: $scope.currentCulture,
			target: "normal"
		};
		
		$scope.propertiesPanel.open($scope, 
			"uk-width-1-1 uk-width-medium-2-3 uk-width-large-1-2");
	};
	
	$scope.activateItem = function(e, item) {
		
		if(item.isNew) {
			
			// Scroll to the end of the list.
			e.target.parent().scrollTop(e.target.parent()[0].scrollHeight);
			
			setTimeout(function() {
				
				$(e.target).
					fadeIn(200).fadeOut(200).
					fadeIn(200).fadeOut(200).
					fadeIn(200).fadeOut(200).
					fadeIn(200);
				
			}, 100);
		}
	}
	
	$scope.edit = function(item) {
		
		item.headerTitle = item.key;
		item.revision = $scope.currentRevision;
		item.culture = $scope.currentCulture;
		
		$scope.editingData = item;
	}
	
	$scope.expand = function(level, item, event) {
		
		event.stopPropagation();
		
		for(var i=0; i<level.items.length; i++)
			level.items[i].expanded = false;
		
		item.expanded = true;
		
		// Slice all other levels off.
		$scope.levels = $scope.levels.slice(0, level.number);
		
		httpEx($scope, "GET", $scope.restBaseUrl + "/items", { 
			
			culture: $scope.currentCulture, 
			parent: item.id 
			
		}).success(function(data, status, headers, config) {
			
			$scope.levels.push({
				number: level.number + 1,
				parent: item.id,
				items: data
			});
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
	
	$scope.contentOffset = function() {
		
		return $(".uk-form").offset();
	}
	
	$scope.updateTree = function(e, ui) {
		
		var items = [];
		
		// Process only the last event. 50 millisecs gap is enough.
		
		if($scope.lastOrganizePendingUpdateTimeout) {
			
			clearTimeout($scope.lastOrganizePendingUpdateTimeout);
			$scope.lastOrganizePendingUpdateTimeout = null;
		}
		
		$scope.lastOrganizePendingUpdateTimeout = setTimeout(function() {
			
			$($scope.levels).each(function(i, level) {
				
				$(level.items).each(function(i, item) {
					
					item.parent = level.parent;
					item.order = i;
					
					items.push(item);
				});
			});

			var data = [] 
			$(items).each(function(i, item) {
				
				data.push({ id: item.id, parent: item.parent, order: item.order});
			});
			
			$scope.isTreeUpdating = true;
			
			httpEx($scope, "POST", $scope.restBaseUrl + "/tree", { tree: JSON.stringify(data) }).
				success(function(data, status, headers, config) {
					
					$scope.isTreeUpdating = false;
				});
		}, 50);
	}
	
	$scope.propertiesPanel.on("save", function(params, callback) {
		
		var action = $("form[name='propertiesPanel.propertiesForm']").attr("action");

		var culture = $("#cultureSelection").val();
		$scope.editingData.culture = culture;
		
		var method = "POST";
		if($scope.editingData.id) {
			
			method = "PUT";
		}
		
		submitForm($scope, $scope.propertiesPanel.propertiesForm, 
			method, action, $scope.editingData).
			success(function(data, status, headers, config) {
				
				if(method == "POST") {
					
					data.isNew = true;
					$scope.levels[$scope.editingLevel].items.push(data);
				}
				
				callback(true);
			});
	});
	
	$scope.propertiesPanel.on("culture-changed", function(params, callback) {
		
		alert("come");
	});
	
	var selectedCulture = $("#cultureSelection").val();
	$("#cultureSelection").on("change", function() {
		
		$window.location.href = $scope.baseUrl + "/?culture=" + $(this).val();
		$("#cultureSelection").val(selectedCulture);
	});
}]);