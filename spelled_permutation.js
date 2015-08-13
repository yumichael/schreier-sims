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
			before: function(other) {
				var prod = inherit.prototype.before.call(this, other);
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