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
		this.image = arr;
		if (arr === undefined || arr.length === 0 || arr.length === 1) {
			arr.length = 0;
		} else {
			for (var i = arr.length - 1; i >= 0; --i) {
				if (arr[i] !== i) {
					break;
				}
			}
			arr.length = i + 1;
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
		var base = Permutation;
		var TIMES = ' ';
		var RAISE = '^';
		function SpelledPermutation(arr, spelling) {
		    base.call(this, arr);
		    if (this.support() === 0) {
		        this.spelling = '';
		        return;
		    }
		    if (spelling !== undefined) {
				this.spelling = spelling;
			}
		}
		extend(base, SpelledPermutation, {
			spellOut: function() {
				var arr = [];
				this.spelling.split(TIMES).forEach(function(str) {
					var pair = str.split(RAISE);
					pair[1] = parseInt(pair[1]);
					arr.push(pair);
				});
				return arr;
			},
			spellIn: function(spelledOut) {
				var arr = [];
				spelledOut.forEach(function(pair) {
					arr.push(pair.join(RAISE));
				});
				return arr.join(TIMES);
			},
			inverse: function() {
				var inverse = base.prototype.inverse.call(this);
				var spelledOut = this.spellOut();
				for (var i = 0; i < spelledOut.length; ++i) {
					spelledOut[i][1] *= -1;
				}
				spelledOut.reverse();
				return new this.constructor(inverse, this.spellIn(spelledOut));
			},
			times: function(other) {
				var prod = base.prototype.times.call(this, other);
				if (other instanceof SpelledPermutation) {
					var thisSpelled = this.spellOut();
					var otherSpelled = other.spellOut();
					var thisIndex = thisSpelled.length - 1;
					var otherIndex = 0;
					while (thisIndex in thisSpelled && otherIndex in otherSpelled &&
						thisSpelled[thisIndex][0] === otherSpelled[otherIndex][0]) {
						var sum = thisSpelled[thisIndex][1] + otherSpelled[otherIndex][1];
						--thisIndex;
						if (sum !== 0) {
							otherSpelled[otherIndex][1] = sum;
							break;
						}
						++otherIndex;
					}
					thisSpelled.splice(thisIndex + 1, thisSpelled.length);
					otherSpelled.splice(0, otherIndex);
					return new this.constructor(prod, this.spellIn(thisSpelled.concat(otherSpelled)));
				} else {
					return prod;
				}
			},
		});
		SpelledPermutation.TIMES = TIMES;
		SpelledPermutation.RAISE = RAISE;
		return SpelledPermutation;
	}());



	var Column = (function () {
		var InversePermutation = (function() {
			var base = SpelledPermutation;
			function InversePermutation() {
				base.apply(this, arguments);
				var inverse = this.inverse();
				this.preimage = inverse.image;
				this.inverseSpelling = inverse.spelling;
			}
			extend(base, InversePermutation, {
				inverse: function() {
					return new base(this.preimage, this.inverseSpelling);
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
			this.rep[this.supportValue - 1] = new SpelledPermutation();
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
						column.toAdd.dequeue(column.rep[result].times(gen));
					});
				}
				else { // result is reduced permutation
					column.pred().close(result);
				}
			},
			reduce: function(gen) {
				var column = this;
				var k = column.support() - 1;
				var j = gen.sends(k);
				if (column.rep[j] === undefined) {
					column.rep[j] = gen;
					return j;
				}
				else {
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
					if (this.next > 300) {
						this.array.splice(0, this.next);
						this.next = 0;
					}
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
		    elem = new SpelledPermutation(elem, name + SpelledPermutation.RAISE + '1');
			var table = this;
			var supp = elem.support();
			while (table.support() < supp) {
				table.entry.push(new Column(table.entry[table.entry.length - 1]));
			}
			if (table.entry[table.entry.length - 1].feed(elem)) {
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
		get[attr] = from[attr];
	}
	return get;
}

alert("Done loading!");

function go() {
	var T = new Table();
	T.add([1,0], 't0');
}