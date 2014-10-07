var Group = (function(){
	function word(spelling) {
		var arr = [];
		spelling.base.forEach(function(symb, i) {
			arr.push(symb + '^' + spelling.exponent[i]);
		});
		return arr.join(' ');
	}

	function Group(table) {
		var group = this;
		if (!(this instanceof Group)) {
			return new Group(table);
		}
		this.table = table;
		this.generator = table.key;
	}
	extend(Group, {
		support: function() {
			return this.table.support();
		},
		compute: function(elem) {
			var productRep = this.table.compute(elem);
			if (productRep === null) {
				return null;
			}
			return word(productRep.spelling);
		},
		represent: function() {
			var entries = this.table.entries();
			entries.forEach(function(col, i) {
				col.forEach(function(rep, j) {
					if (rep !== undefined) {
						col[j] = word(rep.spelling);
					}
				});
			});
			return entries;
		},
		pattern: function() {
			var entries = this.table.entries();
			var pattern = '';
			for (var i = 0; i < entries.length; ++i) {
				for (var j = 0; j <= i; ++j) {
					if (entries[i][j] !== undefined) {
						pattern += '.';
					} else {
						pattern += ' ';
					}
				}
				pattern += '\n';
			}
			return pattern;
		},
		chain: function() {
			var entries = this.table.entries();
			return entries.reduce(function(chain, col) {
				chain.push(col.reduce(function(sum, rep) {
					return sum + (rep !== undefined);
				}, 0));
				return chain;
			}, []);
		},
		size: function() {
			var entries = this.table.entries();
			return entries.reduce(function(prod, col) {
				return prod * col.reduce(function(sum, rep) {
					return sum + (rep !== undefined);
				}, 0);
			}, 1);
		}
	});

	return Group;
}());




alert("Done loading!");



function view(table) {
	var arr = [];
	table.entry.forEach(function(entry, n) {
		var stuff = [];
		stuff.length = n;
		entry.rep.forEach(function(perm, k) {
			stuff[k] = perm.image.concat(word(perm.spelling));
		});
		arr.push(stuff);
	});
	return arr;
}

/*
       0 1 2
       3 4 5
       6 7 8
 91011121314151617
181920212223242526
272829303132333435
      363738
      394041
      424344

      454647
      484950
      515253      
*/

function m1 (arr) {
	for (var i = 0; i < arr.length; ++i) {
		--arr[i];
	}
	return arr;
}

var bottom = m1([18, 27, 36, 4, 5, 6, 7, 8, 9, 3, 11, 12, 13, 14, 15, 16, 17, 45, 2,
20, 21, 22, 23, 24, 25, 26, 44, 1, 29, 30, 31, 32, 33, 34, 35, 43,
37, 38, 39, 40, 41, 42, 10, 19, 28, 52, 49, 46, 53, 50, 47, 54, 51, 48]);
var toparr = m1([1, 2, 3, 4, 5, 6, 16, 25, 34, 10, 11, 9, 15, 24, 33, 39, 17, 18, 19,
20, 8, 14, 23, 32, 38, 26, 27, 28, 29, 7, 13, 22, 31, 37, 35, 36, 12,
21, 30, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54]);
var front = m1([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
20, 21, 22, 23, 24, 25, 26, 27, 31, 32, 33, 34, 35, 36, 48, 47, 46,
39, 42, 45, 38, 41, 44, 37, 40, 43, 30, 29, 28, 49, 50, 51, 52, 53, 54]);
var back = m1([3, 6, 9, 2, 5, 8, 1, 4, 7, 54, 53, 52, 10, 11, 12, 13, 14, 15, 19,
20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 18, 17, 16]);
var left = m1([13, 2, 3, 22, 5, 6, 31, 8, 9, 12, 21, 30, 37, 14, 15, 16, 17, 18, 11,
20, 29, 40, 23, 24, 25, 26, 27, 10, 19, 28, 43, 32, 33, 34, 35, 36,
46, 38, 39, 49, 41, 42, 52, 44, 45, 1, 47, 48, 4, 50, 51, 7, 53, 54]);
var right = m1([1, 2, 48, 4, 5, 51, 7, 8, 54, 10, 11, 12, 13, 14, 3, 18, 27, 36, 19,
20, 21, 22, 23, 6, 17, 26, 35, 28, 29, 30, 31, 32, 9, 16, 25, 34, 37,
38, 15, 40, 41, 24, 43, 44, 33, 46, 47, 39, 49, 50, 42, 52, 53, 45]);

var bm = Permutation(bottom);
var tp = Permutation(toparr);
var fn = Permutation(front);
var bk = Permutation(back);
var lf = Permutation(left);
var rg = Permutation(right);

function rubic() {
	var cb = new Table();
	cb.add(tp, 'tp');
	cb.add(fn, 'fn');
	cb.add(lf, 'lf');
	cb.add(rg, 'rg');
	cb.add(bk, 'bk');
	cb.add(bm, 'bm');
	return cb;
}