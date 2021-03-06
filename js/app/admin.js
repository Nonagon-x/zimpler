angular.module("admin", ['common', 'generic-modal', 'file-manager', 'ngAnimate', 'ngFileUpload'])

.factory("keydownHandlers", function() {

	return [];
})

.factory("requestParams", function() {

	return {

		create: function($scope, givenParams) {

			var params = null;

			if($scope.csrf) {
				params = $scope.csrf;
			} else {
				params = {};
			}

			for(var n in givenParams) {

				params[n] = givenParams[n];
			}

			return params;
		}
	};
})

.service("propertiesPanel", 
	['$http', '$timeout', '$sce', '$window', 'checkFormDirty',
	function($http, $timeout, $sce, $window, checkFormDirty) {
	
	return function() { 

		return {
			
			isOpen: false,
			scrollTop: 0,
			scrollMaxReached: false,
			panel: $(".n-properties-panel"),
			propertiesBody: $(".n-properties-panel .n-body"),
			widthClasses: "uk-width-1-1 uk-width-medium-2-3 uk-width-large-6-10",
			scope: null,
			observers: {},
			isCommandsHidden: false,
			isHeaderExpanded: false,

			dom: function(selector) {

				return $(selector);
			},
			
			on: function(event, delegate) {
				
				if(event) {
					
					if(!this.observers[event])
						this.observers[event] = [];
					
					this.observers[event].push(delegate);
				}
			},
			
			off: function(event, delegate) {
				
				if(event && this.observers[event]) {
					
					var observers = this.observers[event];
					var newObservers = [];
					
					for(var i=0; i<observers.length; i++) {
						
						if(observers[i] == delegate)
							continue;
							
						newObservers.push(observers[i]);
					}
					
					this.observers[event] = newObservers;
				}
			},
			
			fire: function(event, data, callback) {
				
				if(!this.observers[event])
					this.observers[event] = [];
				
				var observers = this.observers[event];	
				for(var i=0; i<observers.length; i++) {
					
					var delegate = observers[i];
					delegate(data, callback);
				}
			},
			
			open: function($scope, widthClasses) {
				
				if(widthClasses)
					this.widthClasses = widthClasses;
			
				this.isOpen = true;
				this.propertiesBody.scrollTop(0);
				this.scope = $scope;

				console.debug(this);
				
				var $this = this;
				
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
				
				var resize = function() {
					
					if($this.scope) {
						
						$this.offsetLeft = $this.panel.offset().left;
						$this.scope.$apply();
					}
				};
				
				this.resize = resize;
				$($window).on("resize", resize);
				
				this.panel.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
					function(e) {
					
						$this.offsetLeft = $this.panel.offset().left;
						
						if($this.scope)
							$this.scope.$apply();
					});
				
				$timeout(function() {
					
					$this.propertiesBody.find(':input:visible:enabled:first').focus();

					$this.propertiesForm.$setPristine();
					$this.propertiesForm.$setUntouched();
					
				}, 300);
				
				$timeout(function() {
					
					bodyScroll();
					
				}, 1);

				$this.fire("open");
			},
			
			close: function(option) {
				
				var $this = this;

				var performClose = function() {

					$this.offsetLeft = 0;
					$this.isOpen = false;
		
					$this.propertiesBody.off("scroll", $this.bodyScroll);
					$($window).off("resize", $this.resize);
					
					$this.fire("close");
					
					$timeout(function() {
						
						if($this.scope) {
							$this.scope.$apply(function() {

								$this.propertiesForm.$setPristine();
								$this.scope = null;

								$this.fire("closed");
							});
						}
							
					}, 300);
				}

				option = option || {};

				if(option.force) {

					performClose();

				} else {

					checkFormDirty(this.propertiesForm).confirm(function() {

						$this.propertiesForm.$setUntouched();
						performClose();
					});
				}
			},
			
			save: function($event, option) {

				if($event)
					$event.preventDefault();
					
				this.propertiesForm.$setSubmitted();
				
				if(!this.propertiesForm.$valid) {
					return;
				}
				
				var $this = this;
				this.fire("save", { event: $event }, function(result) {

					$this.propertiesForm.$setUntouched();
					$this.propertiesForm.$setPristine();
					
					if(result && option && option.alsoClose) {
						
						$this.close();
					}

					if(result && option && option.doNext) {

						option.doNext();
					}
				});
			},

			saveIfDirty: function($event, option) {

				if($event)
					$event.preventDefault();

				if(!this.propertiesForm.$dirty) {

					if(option && option.doNext)
						option.doNext();

					return;
				}

				this.save($event, option);
			},

			delete: function() {

				var $this = this;
				this.fire("delete", null, function(result) {

					if(result) {
						
						$this.close();
					}
				});
			}
		};
	};
}])

.factory('fileManagerPopup', function(fileManager) {

	return {

		open: function(callback) {

			var modal = UIkit.modal(".n-file-browser");
			modal.show();

			fileManager.setAsModal();
			fileManager.updateLayout();

			this._callback = callback;
		},

		close: function() {

			var modal = UIkit.modal(".n-file-browser");
			modal.hide();
		},

		commit: function() {

			if(this._callback)
				this._callback(fileManager.scope.selectedItem);

			this.close();
		}
	}
})

.service('checkableListManager', [function($location) {

	return function() {

		var checkableListManager = {

			listPath: null,
			scope: null,
			isCheckActivated: false,
			headerCheckBox: null,
			checkedItems: [],

			resolveList: function() {

				if(this.listPath) {

					var items = this.listPath.split(".");
					var list = this.scope;

					for(var i=0; i<items.length; i++) {

						list = list[items[i]];
					}

					return list;

				} else  {

					return this.scope.list;
				}
			},

			isAnyItemChecked: function() {

				var list = this.resolveList();

				if(!list || !list.items) return false;

				var checkedItems = $.grep(list.items, function(item, i) {
					
					return item.checked;
				});

				return checkedItems.length > 0;
			},

			isAllItemsChecked: function() {

				var list = this.resolveList();

				if(!list || !list.items) return false;

				var checkedItems = $.grep(list.items, function(item, i) {
					
					return item.checked;
				});

				return checkedItems.length == list.items.length;
			},

			getCheckedItems: function() {

				var list = this.resolveList();

				if(!list || !list.items) return [];

				var items = [];
				for(var i=0; i<list.items.length; i++) {

					if(list.items[i].checked)
						items.push(list.items[i]);
				}

				return items;
			},

			checkAllItems: function() {

				var list = this.resolveList();

				if(!list || !list.items) return;

				for(var i=0; i<list.items.length; i++) {

					list.items[i].checked = true;
				}

				this.itemCheckStateChanged();
			},

			uncheckAllItems: function() {

				var list = this.resolveList();

				if(!list || !list.items) return;

				for(var i=0; i<list.items.length; i++) {

					list.items[i].checked = false;
				}

				this.itemCheckStateChanged();
			},

			itemCheckStateChanged: function() {

				var isAllChecked = this.isAllItemsChecked();
				var isAnyChecked = this.isAnyItemChecked();

				this.checkedItems = this.getCheckedItems();
				this.isCheckActivated = isAnyChecked;

				if(this.headerCheckBox) {
					this.headerCheckBox.prop("checked", isAllChecked);
				}
			},

			initialize: function($scope, selector, propertiesPanel, list) {

				this.scope = $scope;
				this.listPath = list;

				var $this = this;

				$(function() {

					$this.headerCheckBox = $(selector + " .freeze-header").find("input[type=checkbox]");
					$this.headerCheckBox.on("change", function() {

						$scope.$apply(function() {
							if($this.headerCheckBox.is(':checked')) {
								$this.checkAllItems();
							} else {
								$this.uncheckAllItems();
							}
						});
					});
				});

				if(propertiesPanel) {

					propertiesPanel.on("open", function() {

						$this.headerCheckBox.prop("disabled", true);
					});

					propertiesPanel.on("close", function() {

						$this.headerCheckBox.prop("disabled", false);
					});
				}
			}
		};

		return checkableListManager;
	}
}])

.controller('AdminController', 
	["$scope", "$locale", "$interval", "$http", "$compile", "keydownHandlers", "fileManager", "fileManagerPopup",
	function($scope, $locale, $interval, $http, $compile, keydownHandlers, fileManager, fileManagerPopup) {
	
	var mainContentBody = $(".n-body .n-content");

	$scope.baseUrl = null;
	$scope.csrf = null;
	$scope.mainContentBodyScrollTop = 0;
	$scope.mainContentBodyScrollMaxReached = false;
	$scope.fileManagerSetting = window._fileManagerSetting;
	$scope.fileManager = fileManager;
	$scope.fileManagerPopup = fileManagerPopup;

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

	$(function() {

		// Prevent the backspace key from navigating back and also
		// fire keydown event.
		$(document).unbind('keydown').bind('keydown', function (event) {

	    	for(var i=0; i<keydownHandlers.length; i++)
	    		keydownHandlers[i](event);

		    var doPrevent = false;
		    if (event.keyCode === 8) {

		        var d = event.srcElement || event.target;
		        if ((d.tagName.toUpperCase() === 'INPUT' && (
		        	
		                 d.type.toUpperCase() === 'TEXT' ||
		                 d.type.toUpperCase() === 'NUMBER' ||
		                 d.type.toUpperCase() === 'PASSWORD' || 
		                 d.type.toUpperCase() === 'FILE' || 
		                 d.type.toUpperCase() === 'EMAIL' || 
		                 d.type.toUpperCase() === 'NUMBER' || 
		                 d.type.toUpperCase() === 'SEARCH' || 
		                 d.type.toUpperCase() === 'DATE' )
		             ) || 
		             d.tagName.toUpperCase() === 'TEXTAREA') {

		            doPrevent = d.readOnly || d.disabled;

		        } else {

		            doPrevent = true;
		        }
		    }

		    if (doPrevent) {

		        event.preventDefault();
		    }
		});
	});

	$interval(function() {

		$http({
			method: "GET", 
			url: $scope.baseUrl + "admin/rest/checkin"
		});

	}, 180000);

	$(window).on("focus", function() {

		// Reload if session is no longer valid.

		$http({
			method: "GET", 
			url: $scope.baseUrl + "admin/rest/checkin"
		}).error(function(data, status, headers, config) {

			if(status == 404) {

				window.forceReload = true;
				document.location.reload();
			}
		});

	});
}]);
