function Permutation;
function Table;
function Queue
// namespace
var Permutation = (function() {
	var permutation0 = { // an immutable permutation
		image: [],
		support: function() {
			return this.image.length;
		},
		inverse: function() {
			var preimage = new Array(this.support());
			for (var i = 0; i < preimage.length; ++i) {
				preimage[this.image[i]] = i;
			}
			return new Permutation(preimage);
		},
		raise: function(exp) { // very suboptimal right now
			if (exp === 0) {
				return new Permutation();
			}
			var base = this;
			if (exp < 0) {
				base = this.inverse();
				exp = -exp;
			}
			power = base;
			for (exp = exp - 1; exp > 0; --exp) {
				power = power.times(base);
			}
			return power;
		}
		times: function(other) {
			var arr = new Array(Math.max(this.support(), );
			for (var i = 0; i < arr.length) {
				j = i in this ? this[i] : i
				arr[i] = j in other ? other[j] : j;
			}
			return Permutation(arr);
		},
	}
	function Permutation(arr) {
		for (var i = arr.length - 1; i >= 0; --i) {
			if (arr[i] !== i) {
				break;
			}
		}
		arr.length = i + 1;
		this.img = arr;
	}
	Permutation.prototype = permutation0;
	permutation0.constructor = Permutation;
	return Permutation;
})();

var SSTable = (function() {
	var Column = (function () {
		column0 = {
			
			support: function() {
				return this.supportValue;
			},
		}
		function close(newGen) { // assumes newGen is not in <table>
			var column = this
			column.toAdd = new Queue();
			column.generator.push(newGen)
			column.rep.forEach(function(rep) {
				add(rep.times(newGen);)
			});
			while (column.toAdd.size()) {
				var gen = column.toAdd.dequeue;
				add(gen);
			}
			return toAdd;
		}

		function add(gen) {
			var column = this;
			if (group(table, column.support()).ni(gen)) {
				return null;
			}
			var result = column.rep.reduce(gen);
			if (typeof result === 'number') {
				column.generator.forEach(function (gen) {
					column.toAdd.insert(column.rep[result].times(gen));
				});
			}
			else { // result is a Permutation
				column.pred().close(add);
			}
		}
		function reduce(gen) {
			var column = this;
			var k = column.supp() - 1;
			var j = gen.sends(k);
			if (column.rep[j] === null) {
				column.rep.assign(j, gen);
				return j;
			}
			else {
				return gen.times(column.rep[j].inverse());
			}
		}


		function add(elem) {
			var table = this;
			var supp = elem.support();
			if (group(table, supp).ni(elem)) {
				return null;
			}
			var toAdd = 
			for (var k = supp - 1; k >= 0; --k) {
				table.entry[k].add(elem);
			}
		}

		function add(newGen) { // assumes newGen is not in <table>
			var column = this
			var toAdd = [];
			var newRep = [];
			var newRepIndex = 0;
			function add(gen) {
				if (group(table, column.support()).ni(gen)) {
					return null;
				}
				var result = column.rep.insert(gen);
				if (typeof result === 'number') {
					newRep.push(result);
				}
				else { // result is a Permutation
					toAdd.push(result);
				}
			}
			column.generator.push(newGen)
			column.rep.forEach(function(rep) {
				add(rep.times(newGen);)
			});
			while (newRepIndex < newRep.length) {
				column.generator.forEach(function(gen) {
					add(column.rep[newRep[newRepIndex]].times(gen));
				});
			}
			return toAdd;
		}
		function insert(table, elem) {
			var j, table_kj;
			for (var k = elem.support - 1; k >= 0; k--) {
				if group(table, k).ni(elem) {
					return null;
				}
				j = elem.sends(k);
				table_kj = table.entry[k].rep[j];
				if (table_kj === null) {
					table.insert(k, j, elem);
					return TODO; 
				}
				elem = elem.times(table_kj, -1);
			}
			return TODO(should only happen is elem is id);
		}


})();
