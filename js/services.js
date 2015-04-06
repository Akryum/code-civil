'use strict';

angular.module('code-civil-git.services', [])

/* GitHub */

.service('GitService', function ($timeout) {
	var github = new Github({
		token: "",
		auth: "oauth"
	});

	var repo = github.getRepo("steeve", "france.code-civil");

	var cache = new Object();
	
	// Full tree
	var files = null;
	var loadingFiles = false;
	var filesWaiters = new Array();
	
	function loadFullTree() {
		loadingFiles = true;
		repo.getTree('master?recursive=true', function(err, data) {
			files = new Object();
			if(err) {
				console.error(err);
			} else {
				
				// Process objects
				var obj, name;
				for(var i = data.length - 1; i != -1; i--) {
					obj = data[i];
					name = obj.path.substr(obj.path.lastIndexOf('/') + 1).toLowerCase();
					files[name] = obj;
				}
				
				// Apply waiting callbacks
				for(var i = filesWaiters.length - 1; i != -1; i--) {
					filesWaiters[i].apply();
				}
			}
		});
	}

	return {
		/**
		 * Lists the folders under the master branch.
		 */
		getTree: function (callback) {
			var cached = cache['master'];
			if (cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.getTree('master', function (err, data) {
					$timeout(function () {
						cache['master'] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		getFile: function(name, callback) {
			console.log(name);
			if(files) {
				callback.apply(null, [files[name.toLowerCase()]]);
			} else {
				if(!loadingFiles) {
					loadFullTree();
				}
				filesWaiters.push(function(){
					callback.apply(null, [files[name.toLowerCase()]]);
				});
			}
		},
		/**
		 * Lists the file and folders under the path.
		 */
		contents: function (path, callback) {
			var cached = cache[path];
			if (cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.contents('master', path, function (err, data) {
					$timeout(function () {
						cache[path] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		/**
		 * Reads a file.
		 */
		read: function (path, callback) {
			var cached = cache[path];
			if (cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.read('master', path, function (err, data) {
					$timeout(function () {
						cache[path] = {
							err: err,
							data: data
						};
						callback.apply(null, [err, data]);
					});
				});
			}
		},
		/**
		 * Searches the repo for words.
		 */
		search: function (q, callback) {
			repo.search(q, function (err, data) {
				$timeout(function () {
					callback.apply(null, [err, data]);
				});
			});
		},
		/**
		 * Gets commits.
		 */
		getCommits: function (callback) {
			repo.getCommits(null, function (err, data) {
				$timeout(function () {
					callback.apply(null, [err, data]);
				});
			});
		},
		/**
		 * Gets a commit.
		 */
		getCommit: function(sha, callback) {
			var cached = cache['commit_' + sha];
			if (cached) {
				callback.apply(null, [cached.err, cached.data]);
			} else {
				repo.getCommit('master', sha, function (err, data) {
					$timeout(function () {
						cache['commit_' + sha] = {
							err: err,
							data: data
						}
						callback.apply(null, [err, data]);
					});
				});
			}
		}
	};
})

/* Settings */

.service('SettingsService', function () {
	return {
		getItem: function (id, defaultValue) {
			var value = localStorage.getItem(id);
			if (value == null) {
				return defaultValue;
			}
			return value;
		},
		setItem: function (id, value) {
			localStorage.setItem(id, value);
		}
	}
})

/* Tools */

.service('Tools', function (GitService) {

	function fromRoman(roman, accept) {
		var s = roman.toUpperCase().replace(/ +/g, ''),
			L = s.length,
			sum = 0,
			i = 0,
			next, val,
			R = {
				M: 1000,
				D: 500,
				C: 100,
				L: 50,
				X: 10,
				V: 5,
				I: 1
			},
			fromBigRoman = function (rn) {
				var n = 0,
					x, n1, S, rx = /(\(*)([MDCLXVI]+)/g;
				while ((S = rx.exec(rn)) != null) {
					x = S[1].length;
					n1 = fromRoman(S[2])
					if (isNaN(n1)) return NaN;
					if (x) n1 *= Math.pow(1000, x)
					n += n1;
				}
				return n;
			}
		if (/^[MDCLXVI)(]+$/.test(s)) {
			if (s.indexOf('(') == 0) return fromBigRoman(s);
			while (i < L) {
				val = R[s.charAt(i++)];
				next = R[s.charAt(i)] || 0;
				if (next - val > 0) val *= -1;
				sum += val;
			}
			if (accept || sum.toRoman() === s) return sum;
		}
		return NaN;
	}

	return {
		fromRoman: fromRoman,

		nameSort: function (name) {
			var score = 0;

			if (name.match(/préliminaire/ig)) {
				score -= 1000;
			}

			var match = name.match(/[a-z]+\s([IVX]+)(er)?/i);
			if (match) {
				score += fromRoman(match[1], true) * 100;
			}

			var match = name.match(/[a-z]+\s([0-9]+)(er)?(\-([0-9]+))?/i);
			if (match) {
				score += parseInt(match[1]) * 100;
				if (match[3]) {
					score += parseInt(match[4]) * 10;
				}
			}

			if (name.match(/bis/ig)) {
				score++;
			}

			return score;
		},

		createProgressivePath: function (path) {
			var match = path.match(/\/?([^\/]*)/ig);
			var result = [];
			var tempPath = "";
			var l = match.length;
			var data, index = 0;
			for (var i = 0; i < l; i++) {
				data = match[i];
				if (data.length > 0) {
					tempPath += data;
					result.push({
						name: data.replace(/\//ig, ""),
						path: tempPath,
						index: index++
					});
				}
			}
			return result;
		},

		getFileName: function (input) {
			if(input) {
				var match = input.match(/^(.+)\.([a-z]+)$/i);
				if (match) {
					input = match[1];
				}
			}
			return input;
		},
		
		parseArticle: function (data, path) {
			data = data.substr(data.indexOf('----') + 5);
			
			var parentPath = path.substring(0, path.lastIndexOf('/'));
			data = data.replace(/article\s([0-9]+(-[0-9]+)?)(\sdu\scode\spénal)?/ig, function(match, d1, d2, d3){
				if(d3) {
					return match;
				} else {
					return '<a href="#/article/' + d1 + '">' + match + '</a>';
				}
			});
			
			return data;
		},
		
		fixPath: function(path) {
			
			path = path.replace(/\/[^\/]/ig, function(match) {
				return match.toUpperCase();
			});
			
			return path;
		},
		
		formatDiff: function(text) {
			
			text = text.replace(/@@.*@@\s((\+|-)?\s?Article\s[0-9-]+\s?(\+|-)?\s?----)?/ig, "");
			
			var lines = text.split('\n');
			
			var oldText = "";
			var newText = "";
			
			console.log(lines);
			
			var l = lines.length, line;
			for(var i = 0; i < l; i++) {
				line = lines[i];
				
				if(line.match(/^\s*$/ig)) {
					line = "[BR]";
				}
				
				if(line.charAt(0) == '+') {
					newText += line.substr(1) + " ";
				} else if(line.charAt(0) == '-') {
					oldText += line.substr(1) + " ";
				} else {
					oldText += line + " ";
					newText += line + " ";
				}
			}
			
			var dmp = new diff_match_patch();
			
			var d = dmp.diff_main(oldText, newText);
			
			dmp.diff_cleanupSemantic(d);
			
			var ds = dmp.diff_prettyHtml(d);
			
			ds = ds.replace(/\[BR\]/g, "<br/>");
			
			return ds;
		}
	}
})