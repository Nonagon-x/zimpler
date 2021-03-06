angular.module("admin-cms-navigations", ["common", "generic-modal", "admin", "ngAnimate"])

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
	function($scope, $rootScope, $window, $location, submitForm, 
		checkFormDirty, propertiesPanel, httpEx, modal, keydownHandlers) {

	keydownHandlers.push(function($event) {

		if($event.keyCode === 27) {

			$scope.$apply(function() {

				$scope.propertiesPanel.close();
			});
		}
	});

	$scope.loading = true;
	$scope.publishing = false;
	$scope.restBaseUrl = null;
	$scope.editingData = null;
	$scope.editingLevel = 0;
	$scope.propertiesPanel = propertiesPanel;
	$scope.lastOrganizePendingUpdateTimeout = null;
	
	$scope.currentRevision = 0;
	$scope.currentCulture = $location.search().culture || window.defaultLanguage;
	$scope.currentCultureFullName = $("#cultureSelection option:selected").html().trim();
	$scope.currentStatus = null;
	
	$scope.levels = null;
	$scope.view = "columns";
		
	$scope.sortableOptions = {
		
		placeholder: "n-item",
		appendTo: ".n-sortable-container:not(.ng-hide)",
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
	
	$scope.refreshRev = function() {
		
		httpEx($scope, "GET", $scope.restBaseUrl + "/", null).
			success(function(data, status, headers, config) {
			
				$scope.currentRevision = data.rev;
				$scope.currentStatus = data.status;
			});
	};
	
	$scope.refreshItems = function() {

		if(!$scope.levels) {
			
			$scope.levels = [];
			$scope.levels.push({
				number: 1,
				parent: 0,
				items: []
			});
		}
		
		var level = 0;
		
		var fetchLevel = function() {
			
			if(level < $scope.levels.length) {
				
				httpEx($scope, "GET", $scope.restBaseUrl + "/list", { 
					
					culture: $scope.currentCulture, 
					parent: $scope.levels[level].parent 
					
				}).success(function(data, status, headers, config) {
					
					if(level > 0) {
						
						var prevLevelItems = $scope.levels[level - 1].items;
						var itemToExpands = $.grep(prevLevelItems, function(item) {
							
							return item.id == $scope.levels[level].parent;
						});
						
						if(itemToExpands && itemToExpands.length >= 1)
							itemToExpands[0].expanded = true;
					};
					
					$scope.levels[level].items = data;
					level++;
					
					fetchLevel();

					$scope.loading = false;
				});
			}
		}
		
		fetchLevel();
	};

	$scope.delete = function() {

		modal.show(
			"Are you sure you want to delete this revision?<br/>" +
			"This operation cannot be undone.", 
			"Delete confirmation", {
				
				danger: true,
				bgclose: true,
				okTitle: "Yes",
				cancelTitle: "No",
				icon: "exclamation-circle"
			})
			.ok(function() {

				$scope.propertiesPanel.close({force: true});
				
				httpEx($scope, "DELETE", $scope.restBaseUrl, { 
				}).success(function(data, status, headers, config) {
					
					UIkit.notify("<i class='uk-icon-check'></i> " + 
						"The draft revision " + $scope.currentRevision + 
						" has been deleted", { status: "success", timeout: 1000, pos: "top-right" });
						
					$scope.refreshRev();
					$scope.refreshItems();

				}).error(function(data, status, headers, config) {
					
					$scope.publishing = false;
				});
			});
	};
	
	$scope.publish = function() {
	
		modal.show(
			"Are you sure you want to publish this revision?<br/>" +
			"Please double check there are no typo or broken links on any items. Make sure to check on all languages.", 
			"Publish confirmation", {
				
				danger: true,
				bgclose: true,
				okTitle: "Yes",
				cancelTitle: "No",
				icon: "info-circle"
			})
			.ok(function() {
				
				$scope.publishing = true;
				
				httpEx($scope, "POST", $scope.restBaseUrl + "/publish", { 
				}).success(function(data, status, headers, config) {
					
					UIkit.notify("<i class='uk-icon-check'></i> " + 
						"The revision " + $scope.currentRevision + 
						" has been published", { status: "success", timeout: 1000, pos: "top-right" });

					$scope.publishing = false;
					$scope.currentStatus = data.status;
					
				}).error(function(data, status, headers, config) {
					
					$scope.publishing = false;
				});
			});
	};
	
	$scope.newRev = function() {
		
		modal.show(
			"Are you sure you want to create new revision?<br/>&nbsp;", 
			"Confirmation", {
				
				danger: false,
				bgclose: true,
				okTitle: "Yes",
				cancelTitle: "No",
				icon: "info-circle"
			})
			.ok(function() {
				
				httpEx($scope, "POST", $scope.restBaseUrl + "/new", { 
				}).success(function(data, status, headers, config) {
					
					UIkit.notify("<i class='uk-icon-check'></i> " + 
						"New revision created", { status: "success", timeout: 1000, pos: "top-right" });
						
					$scope.refreshRev();
					$scope.refreshItems();
				});
			});
	};
	
	$scope.newItem = function(level) {
		
		$scope.editingLevel = level.number - 1;
		
		$scope.editingData = {
			
			parent: $scope.levels[$scope.editingLevel].parent,
			revision: $scope.currentRevision,
			headerTitle: "New Item",
			culture: $scope.currentCulture,
			target: "normal",
			status: $scope.currentStatus
		};
		
		$scope.propertiesPanel.open($scope, 
			"uk-width-1-1 uk-width-medium-2-3 uk-width-large-1-2");
	};
	
	$scope.edit = function(item, level, index) {

		$scope.editingLevel = level.number - 1;
		
		checkFormDirty($scope.propertiesPanel.propertiesForm).confirm(function() {
			
			item.headerTitle = item.title;
			item.revision = $scope.currentRevision;
			item.culture = $scope.currentCulture;
			
			$scope.editPendingLevel = level;
			$scope.editPendingIndex = index;
			
			$scope.editingData = angular.copy(item);
			$scope.editingData.status = $scope.currentStatus;
			
			$scope.propertiesPanel.open($scope, 
				"uk-width-1-1 uk-width-medium-2-3 uk-width-large-1-2");
		});
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
	};
	
	$scope.expand = function(level, item, event) {
		
		event.stopPropagation();
		
		for(var i=0; i<level.items.length; i++)
			level.items[i].expanded = false;
		
		item.expanded = true;
		
		// Slice all other levels off.
		$scope.levels = $scope.levels.slice(0, level.number);
		
		$scope.levels.push({
			number: level.number + 1,
			parent: item.id,
			items: [],
			loading: true
		});
		
		httpEx($scope, "GET", $scope.restBaseUrl + "/list", { 
			
			culture: $scope.currentCulture, 
			parent: item.id 
			
		}).success(function(data, status, headers, config) {
			
			var level = $scope.levels[$scope.levels.length - 1];
			level.loading = false;
			level.items = data;
		});
	};

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
	};
	
	$scope.contentOffset = function() {
		
		return $(".uk-form").offset();
	};
	
	$scope.contentRight = function() {
		
		var outerWidth = $("form[name='propertiesPanel.propertiesForm']").outerWidth();
		var contentRight = propertiesPanel.offsetLeft - $scope.contentOffset().left;
		
		if(contentRight > outerWidth)
			contentRight = outerWidth;
		
		return Math.max(0, contentRight);
	};
	
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
	};

	$scope.propertiesPanel.on("culture-changed", function(data) {

		var name = $scope.propertiesPanel.dom(
			".n-culture-selection option:selected").html().trim();

		$scope.currentCultureFullName = name;
	});	

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
					
					$scope.editingData = data;
					$scope.editingData.headerTitle = data.title;

					data.isNew = true;
					$scope.levels[$scope.editingLevel].items.push(data);
					
					$scope.editPendingLevel = $scope.levels[$scope.editingLevel];
					$scope.editPendingIndex = $scope.levels[$scope.editingLevel].items.length - 1;
					
				} else {
					
					if($scope.editPendingLevel) {
						
						var level = $scope.editPendingLevel;
						var index = $scope.editPendingIndex;
						
						level.items[index] = data;
					}
				}
				
				callback(true);
			});
	});
	
	$scope.propertiesPanel.on("culture-changed", function(params, callback) {
		
		$scope.currentCulture = params;
		$("#cultureSelection").val($scope.currentCulture);
		
		$scope.refreshItems();
		
		$this.scope.propertiesPanel.propertiesForm.$setPristine();
		$this.scope.propertiesPanel.propertiesForm.$setUntouched();
		
		httpEx($scope, "GET", $scope.restBaseUrl + "/item", { 
			
			culture: $scope.currentCulture, 
			id: $scope.editingData.id 
			
		}).success(function(data, status, headers, config) {
			
			if(!data) {
				
				$scope.editingData = {
					
					parent: $scope.editingData.parent,
					revision: $scope.currentRevision,
					headerTitle: $scope.editingData.headerTitle,
					culture: $scope.currentCulture,
					target: $scope.editingData.target,
					status: $scope.currentStatus
				};
				
			} else {
				
				var headerTitle = $scope.editingData.headerTitle;
				
				$scope.editingData = data;
				$scope.editingData.headerTitle = headerTitle;
				$scope.editingData.status = $scope.currentStatus;
			}
		});
	});

	$scope.propertiesPanel.on("delete", function(params, callback) {

		modal.show(
			"Are you sure you want to delete this item?<br/>" +
			"This operation cannot be undone.", 
			"Delete confirmation", {
				
				danger: true,
				bgclose: true,
				okTitle: "Yes",
				cancelTitle: "No",
				icon: "exclamation-circle"
			})
			.ok(function() {

				httpEx($scope, "DELETE", $scope.restBaseUrl + "/item/" + $scope.editingData.id, { 
				}).success(function(data, status, headers, config) {

					var items = $scope.levels[$scope.editingLevel].items;
					$scope.levels[$scope.editingLevel].items = 
						$.grep(items, function(item) {
							
							return item.id != data.id;
						});

					callback(true);
				});
			});

	});
	
	$scope.propertiesPanel.on("closed", function() {
		
		$scope.editingData = null;
	});
	
	$("#cultureSelection").on("change", function() {
		
		var selectedCulture = $("#cultureSelection").val();
		$scope.currentCulture = selectedCulture;
		$scope.refreshItems();
	});
});