var Permutation = (function () {
	function Permutation(arr) { // assumes array input is a permutation
		if (!(this instanceof Permutation)) {
			return new Permutation(arr);
		}
		if (arr instanceof Permutation) {
			copy(this, arr);
			return;
		}
		if (arr === undefined) {
			arr = [];
		}
		// keeps array as its own internal representation
		if (arr === undefined || arr.length === 0) {
			arr.length = 0;
			this.image = arr;
		} else { // arr instanceof Array
			if (arr[0] instanceof Array) { // cycle form
				var image = [];
				arr.forEach(function(cyc) {
					image[cyc[cyc.length - 1]] = cyc[0];
					for (var i = 1; i < cyc.length; ++i) {
						image[cyc[i - 1]] = cyc[i];
					}
				});
				this.image = image;
			} else { // expanded form
				for (var i = arr.length - 1; i >= 0; --i) {
					if (arr[i] !== i) {
						break;
					}
				}
				arr.length = i + 1;
				this.image = arr;
			}
		}
	}
	extend(Permutation, { // an immutable permutation
		support: function() {
			return this.image.length;
		},
		sends: function(i) {
			return i < this.support() ? this.image[i] : i;
		},
		inverse: function() {
			var preimage = new Array(this.support());
			for (var i = 0; i < preimage.length; ++i) {
				preimage[this.image[i]] = i;
			}
			return new Permutation(preimage);
		},
		before: function(other) {
			var arr = new Array(Math.max(this.support(), other.support()));
			for (var i = 0; i < arr.length; ++i) {
			    var j = i in this.image ? this.image[i] : i;
				arr[i] = j in other.image ? other.image[j] : j;
			}
			return new Permutation(arr);
		},
	});
	Permutation.evaluate = function(str) {
		function makeScanner(tokenizer) {
			return function(str) {
				for (var i = 0; i < str.length; ++i) {
					tokenizer(str.charAt(i));
				}
			};
		}
		function makeTokenizer(parser) {
			var token = '';
			return function(ch) {
				if (/\s/.test(ch)) {
					if (token !== '') {
						parser(token);
						token = '';
					}
				} else if (ch in {'(':0, '[':0, ')':0, ']':0}) {
					if (token !== '') {
						parser(token);
						token = '';
					}
					parser(ch);
				} else {
					token += ch;
				}
			};
		}
		function makeParser(evaluator) {
			var context = '';
			var arr;
			return function(token) {
				if (context === '') {
					if (token in {'(':0, '[':0}) {
						context = token;
						arr = [];
					} else {
						throw "Permutation: expected '(' or '[' in top level context";
					}
				} else {
					var num = parseInt(token);
					if (!isNaN(num)) {
						arr.push(num);
						return;
					}
					if (context === '(') {
						if (token === ')') {
							evaluator(new Permutation([arr]));
							context = '';
						} else {
							throw "Permutation: number or ')' expected in ( context";
						}
					} else if (context === '[') {
						if (token === ']') {
							evaluator(new Permutation(arr));
							context = '';
						} else {
							throw "Permutation: number or ']' expected in [ context";
						}
					}
				}
			};
		}
		var val = new Permutation();
		function evaluator(perm) {
			val = val.before(perm);
		}
		makeScanner(makeTokenizer(makeParser(evaluator)))(str);
		return val;
	};
	return Permutation;
}());