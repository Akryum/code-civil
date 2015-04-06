'use strict';

angular.module('code-civil-git.controllers', ['ui.router', 'code-civil-git.services'])

/* Home */

.controller('HomeCtrl', function (GitService, Tools) {

	var controller = this;

	controller.loading = true;

	controller.treeOrderFunction = function (tree) {
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

.controller('CommitsCtrl', function(GitService) {
	
	var controller = this;
	
	controller.loading = true;
	
	GitService.getCommits(function(err, data) {
		controller.loading = false;
		
		if(err) {
			
		} else {
			controller.commits = new Array();

			var l = data.length, commit;
			for(var i = 0; i < l; i++) {
				commit = data[i];
				if(commit.commit.author.email == "noreply@gouv.fr") {
					controller.commits.push(commit);
				}
			}
		}
	});
})

/* List Tree */

.controller('TreeCtrl', function ($state, $stateParams, GitService, SettingsService, Tools) {

	var controller = this;

	controller.path = Tools.fixPath($stateParams.path);

	controller.loading = true;

	controller.breadcumb = Tools.createProgressivePath(controller.path);

	controller.name = controller.breadcumb[controller.breadcumb.length - 1].name;

	controller.showPreviews = SettingsService.getItem('tree.showPreviews', false);

	controller.treeOrderFunction = function (tree) {
		return Tools.nameSort(tree.name);
	};
	
	controller.summaryOrderFunction = function (tree) {
		return Tools.nameSort(tree.path);
	};

	controller.fileFilterFunction = function (tree) {
		return tree.type == 'file' && !tree.path.match(/readme/ig);
	};

	controller.toggleShowPreviews = function () {
		controller.showPreviews = !controller.showPreviews;
		SettingsService.setItem('tree.showPreviews', controller.showPreviews);
	};

	GitService.contents(controller.path, function (err, tree) {

		controller.loading = false;

		if (err) {
			console.log(err);
			$state.go('error', {
				message: "Dossier introuvable."
			});
		} else {
			controller.tree = tree;
		}
	});
	
	GitService.getTree(function (err, tree) {
		if (err) {
			controller.error = err;
		} else {
			controller.summary = tree;
		}
	});
	
	// Page title
	var title = "";
	for (var i = 0; i < controller.breadcumb.length; i++) {
		title += " - " + Tools.getFileName(controller.breadcumb[i].name);
	}
	document.title = "Code Civil " + title;
})

/* Read Article */

.controller('ReadCtrl', function ($state, $stateParams, GitService, Tools) {

	var controller = this;

	controller.loading = true;
	
	console.log($stateParams);

	if($stateParams.path) {
		controller.path = Tools.fixPath($stateParams.path);
		read();
	} else if($stateParams.id) {
		GitService.getFile("article " + $stateParams.id + ".md", function(file) {
			if(file) {
				controller.path = file.path;
				read();
			} else {
				$state.go('error', {
					message: "Article introuvable."
				});
			}
		})
	}

	function read() {

		controller.breadcumb = Tools.createProgressivePath(controller.path);

		controller.name = controller.breadcumb[controller.breadcumb.length - 1].name;
		
		GitService.read(controller.path, function (err, data) {
			controller.loading = false;

			if (err) {
				console.log(err);
				$state.go('error', {
					message: "Article introuvable."
				});
			} else {
				data = Tools.parseArticle(data, controller.path);

				controller.data = data;
			}
		});

		// Page title
		var title = "";
		for (var i = 0; i < controller.breadcumb.length; i++) {
			title += " - " + Tools.getFileName(controller.breadcumb[i].name);
		}
		document.title = "Code Civil " + title;
	}
})

/* Search */

.controller('SearchCtrl', function (GitService) {
	var controller = this;

	controller.results = null;

	controller.closed = true;
	controller.loading = false;

	controller.search = function (q) {
		controller.results = null;
		controller.message = null;
		controller.loading = true;
		controller.closed = false;
		controller.error = null;
		GitService.search(q, function (err, data) {
			controller.loading = false;
			if (err) {
				controller.error = "Trop de requêtes. Veuillez réessayer un peu plus tard.";
			} else {
				controller.results = data.items;
			}
		});
	};
})

/* Error */

.controller('ErrorCtrl', function ($stateParams) {
	var controller = this;
	
	console.log($stateParams);
	
	controller.message = $stateParams.message;

	document.title = "Code Civil Cloud - Erreur";
})