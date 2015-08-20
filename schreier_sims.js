var TableOption = (function () { // Schereier-Sims algorithm table
// Refer to the paper "Efficient representation of perm groups" by Knuth
// for referencing the code with the algorithm.
// In particular the algorithm is implemented in the Column class
// Look for the tag #Knuth
return function(option) {
	if (option === undefined) {
		option = {};
	}
	
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
			this.domainValue = pred instanceof Column ? pred.domain() + 1 : 1;
			this.rep = new Structure.Representative(this.domainValue);
			this.rep.length = this.domainValue;
			this.rep[this.domainValue - 1] = new InversePermutation();/*
			this.rep.forEach = Structure.Representative_forEach;*/
			this.generator = pred instanceof Column ? copy(new Structure.Generator(), pred.generator) : new Structure.Generator();
		}
		var column0 = {
			close: function(newGen){},
			add: function(gen){},
			reduce: function(gen){return gen;},
			feed: function(elem) {return true;},
			compute: function(elem) {return new Permutation1();}
		};
		extend(Column, {
			domain: function() {
				return this.domainValue;
			},
			close: function(newGen) { // assumes newGen is not in <table>
				var column = this;
				column.toAdd = new Structure.Queue();
				column.generator.push(newGen); // #Knuth A1
				column.add(newGen, true);
				column.rep.forEach(function(rep, k) {
					if (k === this.domainValue - 1) {
						return; // no need to add id * newGen
					}
					column.toAdd.enqueue(rep.before(newGen));
				});
				while (column.toAdd.size()) {
					var gen = column.toAdd.dequeue();
					column.add(gen);
				}
				column.toAdd = undefined;
			},
			add: function(gen, directly) {
				var column = this;
				if (!directly && column.feed(gen)) { // #TODO when gen is id*newGen, you don't need to check this // nvm?? line 126
					// I check membership once and for all here before adding to avoid unnecessary calls to feed on recursion
					return null;
				}
				var result = column.reduce(gen);
				if (typeof result === 'number') {
					column.generator.forEach(function (gen) {
						column.toAdd.enqueue(column.rep[result].before(gen));
					});
				} else { // result is reduced permutation
					column.pred.close(result); // #Knuth B4
				}
			},
			reduce: function(gen) { // #Knuth algorithm B_k(pi) where pi = gen
				var column = this;
				var k = column.domain() - 1;
				var j = gen.sends(k); // #Knuth B1
				if (column.rep[j] === undefined) { // #Knuth B2
					column.rep[j] = new InversePermutation(gen); // #Knuth B2 cont'd
					return j;
				} else { // #Knuth leads into B4 in the parent context upon return
					// # Knuth B3 never happens because I checked that the added perm is new
					return gen.before(column.rep[j].inverse());
				}
			},
			feed: function(elem) { // simply tests membership (same as compute really but this returns boolean)
				var j = elem.sends(this.domain() - 1);
				if (this.rep[j] === undefined) {
					return false;
				}
				return this.pred.feed(elem.before(this.rep[j].inverse()));
			},
			compute: function(elem) { // tests membership of elem in the table; not part of maintenance algorithm
				var j = elem.sends(this.domain() - 1);
				if (this.rep[j] === undefined) {
					return null;
				}
				var result = this.pred.compute(elem.before(this.rep[j].inverse()));
				return result === null ? null : result.before(this.rep[j]);
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
		domain: function() {
			return this.entry.length;
		},
		add: function (elem, name) {
		    elem = new Permutation1(elem, name);
			var table = this;
			var supp = elem.domain();
			while (table.domain() < supp) {
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
			if (elem.domain() > this.domain()) {
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