'use strict';

angular.module('code-civil-git.directives', ['code-civil-git.services'])

/* ng-enter="" */

.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if (event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
})

/* <search-result> */

.directive('searchResult', function(GitService) {
	return {
		restrict: 'E',
		scope: {
			path: '=',
			name: '=',
			searchQuery: '='
		},
		templateUrl: 'partials/directive/search-result.html',
		controller: function($scope, GitService) {

			$scope.preview = null;

			$scope.loading = true;
			
			// Reads article content
			GitService.read($scope.path, function (err, data) {
				$scope.loading = false;
				if (err) {
					$scope.error = err;
				} else {
					data = data.substr(data.indexOf('----') + 5);
					var pattern = $scope.searchQuery.replace(/\s/g, "|");
					data = data.replace(new RegExp(pattern, "igm"), "**$&**");
					$scope.preview = data;
				}
			});
		}
	}
})

/* <article-preview> */

.directive('articlePreview', function(GitService){
	return {
		restrict: 'E',
		scope: {
			path: '='
		},
		templateUrl: 'partials/directive/article-preview.html',
		controller: function($scope) {
			
			$scope.loading = true;
			
			// Reads article content
			GitService.read($scope.path, function (err, data) {
				$scope.loading = false;
				if (err) {
					$scope.error = err;
				} else {
					data = data.substr(data.indexOf('----') + 5);
					$scope.data = data;
				}
			});
		}
	}
})