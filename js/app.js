'use strict';

/* Main app declaration */
angular.module('code-civil-git', ['ui.router', 'btford.markdown', 'code-civil-git.controllers', 'code-civil-git.services', 'code-civil-git.directives'])

/* App Configuration */
.config(function ($stateProvider, $urlRouterProvider) {
	// Default
	$urlRouterProvider.otherwise("/");

	// States
	$stateProvider
		.state('error', {
			params: {
				message: ""
			},
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
		.state('article', {
			url: '/article/{id:.*}',
			templateUrl: "partials/frame/read.html"
		})
})

/* Removes file extension */
.filter("fileName", function (Tools) {
	return Tools.getFileName;
})