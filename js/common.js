angular.module("common", [])

.directive('nShortcut', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		link: function(scope, elem, attrs) {
			
			jQuery(document).on('keydown', function(e){
				
				scope.$apply(scope.keyDown(e));
			});
		}
	};
})

.directive('nDirtyCheck', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			
			window.onbeforeunload = function (event) {
				
				if(!$(elem).hasClass("ng-dirty"))
					return;
				
				var message = 
					'If you leave this page now you are going to lose all unsaved changes.';
				
				return message;
			}
		}
	}
	
})

.factory('httpEx', ['$http', '$sce', function($http, $sce) {
	
	return function($scope, method, url, data) {
		
		$scope.connectionError = false;
		
		var promise = null;
			
		if(method == "POST" || method == "PUT" || method == "DELETE") {
			
			if(!data) data = {};
				
			promise = $http({ 
				
				method: method,
				url: url, 
				data: $.param(data),
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			});
			
		} else {
			
			var params = "";
			if(data) {
				
				params = "?" + $.param(data);
			}
			
			promise = $http({ 
				
				method: method,
				url: url + params
			});
		}
		
		return promise.
			error(function(data, status, headers, config) {
				
				$scope.connectionError = true;
				
				if(status == 0) {
				
					$scope.connectionErrorMessage = $sce.trustAsHtml(
						"Network error. Please check your internet connection and try again.");
						
				} else if(status == 401) {
					
					$scope.connectionErrorMessage = $sce.trustAsHtml(
						"You don't have permission to view the resource.");
						
				} else if(status >= 500) {
					
					$scope.connectionErrorMessage = $sce.trustAsHtml(
						"We are sorry but there is the problem during processing your request.<br/>" +
						"If problem persists, please contact your system administrator.");
						
				} else {
					
					$scope.connectionErrorMessage = $sce.trustAsHtml(
						"We are sorry but unknown error has just occorred :(<br/>" +
						"If problem persists, please contact your system administrator.");
				}
			});
	};
}])

.factory('submitForm', ['$q', 'httpEx', function($q, httpEx) {
	
	function defaultPromise(promise) {
		
		promise.success = function(fn) {
			
			promise.then(function() {
				fn.apply(this, arguments);
			});
			
			return promise;
		}
		
		promise.error = function(fn) {
			
			promise.then(null, function() {
				fn.apply(this, arguments);
			})
			
			return promise;
		}
		
		return promise;
	}
	
	return function($scope, $form, url) {
		
		var defer = $q.defer();
		
		if(!$form.$valid) {
			return defaultPromise(defer.promise);
		}
		
		var method = "POST";
		if($scope.editingData.id) {
			
			method = "PUT";
		}
		
		// All hidden data will be included in the POST.
		$("[name='" + $form.$name + "'] input[type='hidden']").each(function(i, e) {
			
			$scope.editingData[e.name] = $(e).val();
		});
		
		return httpEx($scope, method, url, $scope.editingData);
	};
}])

.factory('checkFormDirty', ['$q', 'modal', function($q, modal) {
	
	function confirmPromise(promise) {
		
		promise.confirm = function(fn) {
			
			promise.then(function() {
				fn.apply(this, arguments);
			});
			
			return promise;
		}
		
		promise.cancel = function(fn) {
			
			promise.then(null, function() {
				fn.apply(this, arguments);
			})
			
			return promise;
		}
		
		return promise;
	}

	return function($form) {
		
		var defer = $q.defer();
		
		if($form.$dirty) {
			
			modal.show(
				"If you continue all changes you have been made will be lost.<br/>" +
				"Are you sure you want to continue?", "Unsafe changes detected", {
					
					danger: true,
					bgclose: true,
					okTitle: "Continue",
					icon: "exclamation-circle"
				})
				.ok(function() {
					
					defer.resolve();
				})
				.cancel(function() {
					
					defer.reject();
				})
				
			return confirmPromise(defer.promise);
		}
		
		var promise = confirmPromise(defer.promise);
		
		defer.resolve();
		
		return promise;
	};
}])

// Extends ngInit with our process to emit 'init' event on the scope.
.directive('ngInit', function() {
	return {
		restrict: 'A',
		scope: true,
		link: function(scope, elem, attrs) {
			
			scope.$emit('init');
		}
	};
})

// Move to the first invalid form when submit.
.directive('nFocusOnError', function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {

            // set up event handler on the form element
            elem.on('submit', function () {

                // find the first invalid element
                var firstInvalid = angular.element(
                    elem[0].querySelector('.ng-invalid'))[0];

                // if we find one, set focus
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            });
        }
    };
});