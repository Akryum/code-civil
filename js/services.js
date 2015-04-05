'use strict';

angular.module('code-civil-git.services', [])

.service('GitService', function ($timeout) {
	var github = new Github({
		token: "",
		auth: "oauth"
	});

	var repo = github.getRepo("steeve", "france.code-civil");

	var cache = new Object();

	return {
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
		search: function (q, callback) {
			repo.search(q, function (err, data) {
				$timeout(function () {
					callback.apply(null, [err, data]);
				});
			});
		},
		getCommits: function (callback) {

		}
	};
})

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

.service('Tools', function () {

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
			var match = input.match(/^(.+)\.([a-z]+)$/i);
			if (match) {
				input = match[1];
			}
			return input;
		}
	}
})