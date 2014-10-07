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
		if (arr === undefined || arr.length === 0 || arr.length === 1) {
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
		times: function(other) {
			var arr = new Array(Math.max(this.support(), other.support()));
			for (var i = 0; i < arr.length; ++i) {
			    var j = i in this.image ? this.image[i] : i;
				arr[i] = j in other.image ? other.image[j] : j;
			}
			return new Permutation(arr);
		},
	});
	return Permutation;
}());

var Table = (function () { // Schereier-Sims algorithm table
	var SpelledPermutation = (function () {
		var inherit = Permutation;
		function SpelledPermutation(arr, spelling) {
		    inherit.call(this, arr);
		    if (this.support() === 0) {
		        this.spelling = {base:[], exponent:[]};
		        return;
		    }
		    if (typeof spelling === "object") {
				this.spelling = spelling;
			} else if (typeof spelling === "string") {
				this.spelling = {base:[spelling], exponent:[1]};
			}
		}
		extend(inherit, SpelledPermutation, {
			inverse: function() {
				var inverse = inherit.prototype.inverse.call(this);
				var base = this.spelling.base.slice();
				var exponent = this.spelling.exponent.slice();
				exponent.forEach(function(exp, i, arr) {
					arr[i] = -exp;
				});
				base.reverse();
				exponent.reverse();
				return new SpelledPermutation(inverse, {base:base, exponent:exponent});
			},
			times: function(other) {
				var prod = inherit.prototype.times.call(this, other);
				if (other instanceof SpelledPermutation) {
					var thisIndex = this.spelling.base.length - 1;
					var otherIndex = 0;
					var sum = 0;
					while (thisIndex >= 0 && otherIndex < other.spelling.base.length) {
						if (this.spelling.base[thisIndex] === other.spelling.base[otherIndex]) {
							sum = this.spelling.exponent[thisIndex] + other.spelling.exponent[otherIndex];
							--thisIndex;
							if (sum !== 0) {
								break;
							}
							++otherIndex;
						} else {
							break;
						}
					}
					var base = this.spelling.base.slice(0, thisIndex + 1);
					base.push.apply(base, other.spelling.base.slice(otherIndex));
					var exponent = this.spelling.exponent.slice(0, thisIndex + 1);
					var otherExponent = other.spelling.exponent.slice(otherIndex);
					if (sum !== 0) {
						otherExponent[0] = sum;
					}
					return new SpelledPermutation(prod, {base:base, exponent:exponent.concat(otherExponent)});
				} else {
					return prod;
				}
			},
		});
		return SpelledPermutation;
	}());



	var Column = (function () {
		var InversePermutation = (function() {
			var inherit = SpelledPermutation;
			function InversePermutation() {
				inherit.apply(this, arguments);
				if (this.inverseValue === undefined) {
					this.inverseValue = inherit.prototype.inverse.call(this);
					this.inverseValue.inverseValue = this;
					this.inverseValue = new InversePermutation(this.inverseValue);
				}
			}
			extend(inherit, InversePermutation, {
				inverse: function() {
					return this.inverseValue;
				}
			});
			return InversePermutation;
		}());


		function Column (pred) {
			if (pred === undefined) {
				copy(this, column0);
			}
			this.pred = pred;
			this.supportValue = pred instanceof Column ? pred.support() + 1 : 1;
			this.rep = new Structure.Representative(this.supportValue);
			this.rep.length = this.supportValue;
			this.rep[this.supportValue - 1] = new InversePermutation();
			this.generator = pred instanceof Column ? copy(new Structure.Generator(), pred.generator) : new Structure.Generator();
		}
		var column0 = {
			close: function(newGen){},
			add: function(gen){},
			reduce: function(gen){return gen;},
			feed: function(elem) {return true;}
		};
		extend(Column, {
			support: function() {
				return this.supportValue;
			},
			close: function(newGen) { // assumes newGen is not in <table>
				var column = this;
				column.toAdd = new Structure.Queue();
				column.generator.push(newGen);
				column.rep.forEach(function(rep) {
					column.add(rep.times(newGen));
				});
				while (column.toAdd.size()) {
					var gen = column.toAdd.dequeue();
					column.add(gen);
				}
				column.toAdd = undefined;
			},
			add: function(gen) {
				var column = this;
				if (column.feed(gen)) { // when gen is id*newGen, you don't need to check this TODO
					return null;
				}
				var result = column.reduce(gen);
				if (typeof result === 'number') {
					column.generator.forEach(function (gen) {
						column.toAdd.enqueue(column.rep[result].times(gen));
					});
				} else { // result is reduced permutation
					column.pred.close(result);
				}
			},
			reduce: function(gen) {
				var column = this;
				var k = column.support() - 1;
				var j = gen.sends(k);
				if (column.rep[j] === undefined) {
					column.rep[j] = new InversePermutation(gen);
					return j;
				} else {
					return gen.times(column.rep[j].inverse());
				}
			},
			feed: function(elem) {
				var j = elem.sends(this.support() - 1);
				if (this.rep[j] === undefined) {
					return false;
				}
				return this.pred.feed(elem.times(this.rep[j].inverse()));
			}
		});

		var Structure = (function () {
			var Representative = Array;
			// assign method

			var Generator = Array;

			var Queue = function(){
				this.array = [];
				this.next = 0;
			};
			extend(Queue, {
				size: function() {
					return this.array.length - this.next;
				},
				enqueue: function(val) {
					return this.array.push(val);
				},
				dequeue: function() {
					/*if (this.next > 300) {
						this.array.splice(0, this.next);
						this.next = 0;
					}*/
					var out = this.array[this.next];
					++this.next;
					return out;
				},
			});

			return {
				Representative: Representative,
				Generator: Generator,
				Queue: Queue,
			};
		}());


		return Column;
	}());


	function Table() {
		this.entry = [];
		this.key = [];
	}
	extend(Table, {
		support: function() {
			return this.entry.length;
		},
		add: function (elem, name) {
		    elem = new SpelledPermutation(elem, name);
			var table = this;
			var supp = elem.support();
			while (table.support() < supp) {
				table.entry.push(new Column(table.entry[table.entry.length - 1]));
			}
			if (supp === 0 || table.entry[table.entry.length - 1].feed(elem)) {
				return null;
			}
			table.key.push(elem);
			table.entry[table.entry.length - 1].close(elem);
			return true;
		},
	});


	return Table;
}());




function Surrogate() {}
function extend() {
	var methodsIndex;
	var sub, base;
	if (typeof arguments[0] === "function" && typeof arguments[1] === "function") {
		base = arguments[0];
		sub = arguments[1];
		methodsIndex = 2;
		Surrogate.prototype = base.prototype;
		sub.prototype = new Surrogate();
		sub.prototype.constructor = sub;
	} else {
		sub = arguments[0];
		methodsIndex = 1;
	}
	var method = arguments[methodsIndex];
	if (typeof method === "object") {
		for (var name in method) {
			if (method.hasOwnProperty(name)) {
				sub.prototype[name] = method[name];
			}
		}
	}
}
function copy(get, from) {
	for (var attr in from) {
		if (from.hasOwnProperty(attr)) {
			get[attr] = from[attr];
		}
	}
	return get;
}

alert("Done loading!");

function word(spelling) {
	var arr = [];
	spelling.base.forEach(function(symb, i) {
		arr.push(symb + '^' + spelling.exponent[i]);
	});
	return arr.join(' ');
}

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

      0 1 2 3 4 5 6 7 8 91011121314151617181920212223242526272829303132333435363738394041424344454647484950515253
topcc            292011    36302112 6        3737     7        3813     8    332415                              




*/