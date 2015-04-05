'use strict';

function fromRoman(roman, accept){
    var s= roman.toUpperCase().replace(/ +/g, ''), 
    L= s.length, sum= 0, i= 0, next, val, 
    R={M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1},
    fromBigRoman= function(rn){
        var n= 0, x, n1, S, rx=/(\(*)([MDCLXVI]+)/g;
        while((S= rx.exec(rn))!= null){
            x= S[1].length;
            n1= Number.fromRoman(S[2])
            if(isNaN(n1)) return NaN;
            if(x) n1*= Math.pow(1000, x)
            n+= n1;
        }
        return n;
    }
    if (/^[MDCLXVI)(]+$/.test(s)){
        if(s.indexOf('(')== 0) return fromBigRoman(s);
        while(i<L){
            val= R[s.charAt(i++)];
            next= R[s.charAt(i)] || 0;
            if(next-val>0) val*= -1;
            sum+= val;
        }
        if(accept || sum.toRoman()=== s) return sum;
    }
    return NaN;
}

function nameSort(name) {
	var score = 0;
		
	if(name.match(/préliminaire/ig)){
		score -= 1000;
	}

	var match = name.match(/[a-z]+\s([IVX]+)(er)?/i);
	if(match) {
		score += fromRoman(match[1], true) * 100;
	}

	var match = name.match(/[a-z]+\s([0-9]+)(er)?(\-([0-9]+))?/i);
	if(match) {
		score += parseInt(match[1]) * 100;
		if(match[3]) {
			score += parseInt(match[4]) * 10;
		}
	}
	
	if(name.match(/bis/ig)) {
		score ++;
	}

	return score;
}

function createProgressivePath(path) {
	var match = path.match(/\/?([^\/]*)/ig);
	var result = [];
	var tempPath = "";
	var l = match.length;
	var data, index = 0;
	for(var i = 0; i < l; i++) {
		data = match[i];
		if(data.length > 0) {
			tempPath += data;
			result.push({
				name: data.replace(/\//ig, ""),
				path: tempPath,
				index: index++
			});
		}
	}
	return result;
}

angular.module('code-civil-git.controllers', ['ui.router', 'code-civil-git.services'])

.controller('HomeCtrl', function (GitService) {
	
	var controller = this;
	
	controller.loading = true;
	
	controller.treeOrderFunction = function(tree) {
		return nameSort(tree.path);
	};
	
	GitService.getTree(function (err, tree) {
	
		controller.loading = false;
		
		if (err) {
			controller.error = err;
		} else {
			controller.tree = tree;
		}
	});
	
	document.title = "Code Civil Realtime";
})

.controller('TreeCtrl', function ($stateParams, GitService, SettingsService) {
	
	var controller = this;
	
	controller.path = $stateParams.path;
	
	controller.loading = true;
	
	controller.breadcumb = createProgressivePath(controller.path);
	
	controller.name = controller.breadcumb[controller.breadcumb.length - 1].name;
	
	controller.showPreviews = SettingsService.getItem('tree.showPreviews', false);
	
	controller.treeOrderFunction = function(tree) {
		return nameSort(tree.name);
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
		title += " - " + getFileName(controller.breadcumb[i].name);
	}
	document.title = "Code Civil " + title;
})

.controller('ReadCtrl', function ($stateParams, GitService) {
	
	var controller = this;
	
	controller.path = $stateParams.path;
	
	controller.loading = true;
	
	controller.breadcumb = createProgressivePath(controller.path);
	
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
		title += " - " + getFileName(controller.breadcumb[i].name);
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

.controller('SearchResultCtrl', function($scope, GitService) {
	var controller = this;
	
	controller.preview = null;
	
	controller.result = $scope.$parent.result;
	controller.searchQuery = $scope.$parent.$parent.searchQuery;
	
	controller.loading = true;
	
	GitService.read(controller.result.path, function (err, data) {
		controller.loading = false;
		if (err) {
			controller.error = err;
		} else {
			data = data.substr(data.indexOf('----') + 5);
			var pattern = controller.searchQuery.replace(/\s/g, "|");
			data = data.replace(new RegExp(pattern, "igm"), "**$&**");
			controller.preview = data;
		}
	});
})

.controller('ErrorCtrl', function () {
	this.message = "Ceci est un message d'erreur.";
	
	document.title = "Code Civil Realtime - Erreur";
})