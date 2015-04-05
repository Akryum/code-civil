'use strict';

angular.module('code-civil-git.services', [])

.service('GitService', function($timeout){
	var github = new Github({
	  token: "",
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

.service('SettingsService', function() {
	return {
		getItem:function(id, defaultValue) {
			var value = localStorage.getItem(id);
			if(value == null) {
				return defaultValue;
			}
			return value;
		},
		setItem:function(id, value) {
			localStorage.setItem(id, value);
		}
	}
})