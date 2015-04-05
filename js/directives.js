'use strict';

angular.module('code-civil-git.directives', ['code-civil-git.services'])

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

.directive('articlePreview', function(GitService){
	return {
		restrict: 'E',
		scope: {
			path: '='
		},
		templateUrl: 'partials/directive/article-preview.html',
		controller: function($scope) {
			$scope.loading = true;
			console.log($scope.path);
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