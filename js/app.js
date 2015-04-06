'use strict';

/* Main app declaration */
angular.module('code-civil-git', ['ngSanitize', 'ui.router', 'btford.markdown', 'sticky', 'code-civil-git.controllers', 'code-civil-git.services', 'code-civil-git.directives'])

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

/* Format diff */
.filter("diff", function (Tools) {
	return Tools.formatDiff;
})

/* Status */
.filter("status", function () {
	return function(status) {
		switch(status) {
				case 'modified': return 'Modifié';
				case 'added': return 'Ajouté';
				case 'removed': return 'Supprimé';
				default: return status;
		}
	}
})