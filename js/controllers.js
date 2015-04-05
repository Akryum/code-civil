'use strict';

angular.module('code-civil-git.controllers', ['ui.router', 'code-civil-git.services'])

.controller('HomeCtrl', function (GitService, Tools) {
	
	var controller = this;
	
	controller.loading = true;
	
	controller.treeOrderFunction = function(tree) {
		return Tools.nameSort(tree.path);
	};
	
	GitService.getTree(function (err, tree) {
	
		controller.loading = false;
		
		if (err) {
			controller.error = err;
		} else {
			controller.tree = tree;
		}
	});
	
	document.title = "Code Civil Cloud";
})

.controller('TreeCtrl', function ($stateParams, GitService, SettingsService, Tools) {
	
	var controller = this;
	
	controller.path = $stateParams.path;
	
	controller.loading = true;
	
	controller.breadcumb = Tools.createProgressivePath(controller.path);
	
	controller.name = controller.breadcumb[controller.breadcumb.length - 1].name;
	
	controller.showPreviews = SettingsService.getItem('tree.showPreviews', false);
	
	controller.treeOrderFunction = function(tree) {
		return Tools.nameSort(tree.name);
	};
	
	controller.fileFilterFunction = function(tree) {
		return tree.type == 'file' && !tree.path.match(/readme/ig);
	};
	
	controller.toggleShowPreviews = function() {
		controller.showPreviews = !controller.showPreviews;
		SettingsService.setItem('tree.showPreviews', controller.showPreviews);
	};
	
	GitService.contents(controller.path, function (err, tree) {
	
		controller.loading = false;
		
		if (err) {
			controller.error = err;
		} else {
			controller.tree = tree;
		}
	});
	
	var title = "";
	for(var i = 0; i < controller.breadcumb.length; i ++){
		title += " - " + Tools.getFileName(controller.breadcumb[i].name);
	}
	document.title = "Code Civil " + title;
})

.controller('ReadCtrl', function ($stateParams, GitService, Tools) {
	
	var controller = this;
	
	controller.path = $stateParams.path;
	
	controller.loading = true;
	
	controller.breadcumb = Tools.createProgressivePath(controller.path);
	
	controller.name = controller.breadcumb[controller.breadcumb.length - 1].name;
	
	GitService.read(controller.path, function (err, data) {
	
		controller.loading = false;
		
		if (err) {
			controller.error = err;
		} else {
			data = data.substr(data.indexOf('----') + 5);
			controller.data = data;
		}
	});
	
	var title = "";
	for(var i = 0; i < controller.breadcumb.length; i ++){
		title += " - " + Tools.getFileName(controller.breadcumb[i].name);
	}
	document.title = "Code Civil " + title;
})

.controller('SearchCtrl', function(GitService) {
	var controller = this;
	
	controller.results = null;
	
	controller.closed = true;
	controller.loading = false;
	
	controller.search = function(q) {
		controller.results = null;
		controller.message = null;
		controller.loading = true;
		controller.closed = false;
		controller.error = null;
		GitService.search(q, function(err, data) {
			controller.loading = false;
			if(err) {
				controller.error = "Trop de requêtes. Veuillez réessayer un peu plus tard.";
			} else {
				controller.results = data.items;
			}
		});
	};
})

.controller('ErrorCtrl', function () {
	this.message = "Ceci est un message d'erreur.";
	
	document.title = "Code Civil Cloud - Erreur";
})