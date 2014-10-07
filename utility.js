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