var TableOption = (function () { // Schereier-Sims algorithm table

return function(option) {
	if (option === undefined) {
		option = {};
	}

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
				for (var i = 0; i < exponent.length; ++i) {
					exponent[i] *= -1;
				}
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
	
	var Permutation1 = Permutation;
	if (option.spelling) {
		Permutation1 = SpelledPermutation;
	}


	var Column = (function () {
		var InversePermutation = (function() {
			var inherit = Permutation1;
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
			this.rep[this.supportValue - 1] = new InversePermutation();/*
			this.rep.forEach = Structure.Representative_forEach;*/
			this.generator = pred instanceof Column ? copy(new Structure.Generator(), pred.generator) : new Structure.Generator();
		}
		var column0 = {
			close: function(newGen){},
			add: function(gen){},
			reduce: function(gen){return gen;},
			feed: function(elem) {return true;},
			compute: function(elem) {return new Permutation();}
		};
		extend(Column, {
			support: function() {
				return this.supportValue;
			},
			close: function(newGen) { // assumes newGen is not in <table>
				var column = this;
				column.toAdd = new Structure.Queue();
				column.generator.push(newGen);
				column.add(newGen, true);
				column.rep.forEach(function(rep, k) {
					if (k === this.supportValue - 1) {
						return;
					}
					column.toAdd.enqueue(rep.times(newGen));
				});
				while (column.toAdd.size()) {
					var gen = column.toAdd.dequeue();
					column.add(gen);
				}
				column.toAdd = undefined;
			},
			add: function(gen, directly) {
				var column = this;
				if (!directly && column.feed(gen)) { // when gen is id*newGen, you don't need to check this TODO
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
			},
			compute: function(elem) {
				var j = elem.sends(this.support() - 1);
				if (this.rep[j] === undefined) {
					return null;
				}
				var result = this.pred.compute(elem.times(this.rep[j].inverse()));
				return result === null ? null : result.times(this.rep[j]);
			}
		});

		var Structure = (function () {
			var Representative = Array;/*
			function forEach(callBack) {
				for (var i = this.length - 1; i >= 0; --i) {
					if (this[i] !== undefined) {
						callBack(this[i], i, this);
					}
				}
			}*/

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
				Representative: Representative,/*
				Representative_forEach: forEach,*/
				Generator: Generator,
				Queue: Queue,
			};
		}());


		return Column;
	}());

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

	function Table() {
		this.entry = [new Column(undefined)];
		this.key = {};
		this.option = option;
	}
	extend(Table, {
		support: function() {
			return this.entry.length;
		},
		add: function (elem, name) {
		    elem = new Permutation1(elem, name);
			var table = this;
			var supp = elem.support();
			while (table.support() < supp) {
				table.entry.push(new Column(table.entry[table.entry.length - 1]));
			}
			if (supp === 0 || table.entry[table.entry.length - 1].feed(elem)) {
				return null;
			}
			table.key[name] = elem;
			table.entry[table.entry.length - 1].close(elem);
			return true;
		},
		include: function(elem) {
			for (var name in elem) {
				if (elem.hasOwnProperty(name)) {
					this.add(elem[name], name);
				}
			}
		},
		compute: function (elem) {
			if (elem.support() > this.support()) {
				return null;
			}
			return this.entry[this.entry.length - 1].compute(elem);
		},
		entries: function() {
			var entries = [];
			for (var n = 0; n < this.entry.length; ++n) {
				var stuff = [];
				var rep = this.entry[n].rep;
				for (var k = 0; k < rep.length; ++k) {
					if (rep[k] !== undefined) {
						stuff[k] = rep[k];
					}
				}
				entries.push(stuff);
			}
			return entries;
		}
	});


	return Table;

}

}());