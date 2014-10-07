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

