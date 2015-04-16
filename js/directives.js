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

.directive('articlePreview', function(GitService, Tools){
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
					
					data = Tools.parseArticle(data, $scope.path);
					
					$scope.data = data;
				}
			});
		}
	}
})

/* <commit> */

.directive('commit', function(GitService, Tools) {
	return {
		restrict: 'E',
		scope: {
			commit: '=',
			path: '='
		},
		templateUrl: 'partials/directive/commit.html',
		controller: function($scope) {
			
			$scope.loading = true;
			
			$scope.diffSelect = [
				{
					value: "diffText",
					label: "Différences"
				},
				{
					value: "oldText",
					label: "Avant"
				},
				{
					value: "newText",
					label: "Après"
				}
			];
			
			if($scope.path) {
				$scope.displayOtherArticles = false;
			}
			
			GitService.getCommit($scope.commit.sha, function(err, data) {
				$scope.loading = false;
				
				if(err) {
					
				} else {
					$scope.files = data.files;
					
					var l = data.files.length, file;
					for(var i = 0; i < l; i ++) {
						file = data.files[i];
						file.diff = Tools.formatDiff(file.patch);
						file.inCurrentPath = (!$scope.path || $scope.path == file.filename);
						file.displayed = file.inCurrentPath;
						file.displayDiff = "diffText";
						
						if(file.inCurrentPath) {
							file.index = i;
						} else {
							file.index = data.files.length + i;
						}
					}
				}
			});
			
		}
	}
})