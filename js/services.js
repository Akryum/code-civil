'use strict';

angular.module('code-civil-git.services', ['ui.router'])

.service('GitService', function($timeout){
	var github = new Github({
	  token: "4bff5e4b2ea79ff0e99b10dc7a9f10291bc7350a",
	  auth: "oauth"
	});
	
	var repo = github.getRepo("steeve", "france.code-civil");
	
	var cache = new Object();
	
	return {
		getTree:function(callback) {
			var cached = cache['master'];
			if(cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.getTree('master', function(err, data) {
					$timeout(function(){
						cache['master'] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		contents:function(path, callback) {
			var cached = cache[path];
			if(cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.contents('master', path, function(err, data) {
					$timeout(function(){
						cache[path] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		read:function(path, callback) {
			var cached = cache[path];
			if(cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.read('master', path, function(err, data) {
					$timeout(function(){
						cache[path] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		search:function(q, callback) {
			repo.search(q, function(err, data) {
				$timeout(function(){
					callback.apply(null, [err, data]);
				});
			});
		}
	};
})