'use strict';

function getFileName(input) {
	var match = input.match(/^(.+)\.([a-z]+)$/i);
	if (match) {
		input = match[1];
	}
	return input;
}

angular.module('code-civil-git', ['ui.router', 'btford.markdown', 'code-civil-git.controllers'])

.config(function ($stateProvider, $urlRouterProvider) {
	// Default
	$urlRouterProvider.otherwise("/");

	// States
	$stateProvider
		.state('error', {
			templateUrl: "partials/frame/error.html"
		})
		.state('home', {
			url: '/',
			templateUrl: "partials/frame/home.html"
		})
		.state('tree', {
			url: '/tree/{path:.*}',
			templateUrl: "partials/frame/tree.html"
		})
		.state('read', {
			url: '/read/{path:.*}',
			templateUrl: "partials/frame/read.html"
		})
})

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

.filter("fileName", function () {
	return getFileName;
})
