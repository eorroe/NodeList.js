(function() {
	function flatten(arr) {
		var nodes = [];
		for(var list of arr) {
			if(list instanceof Array || list instanceof NodeList || list instanceof HTMLCollection) {
				for(var element of Array.from(list)) nodes.push(element);
			} else {
				nodes.push(list);
			}
		}
		return Object.setPrototypeOf(nodes, NL);
	}

	var NL = {};

	for(var key in HTMLElement.prototype) {
		try {
			(function() {
				if(HTMLElement.prototype[key].constructor == Function) {
					var key1 = key;
					NL[key] = function() {
						if(key1 == 'remove') var nodes = Array.from(this);
						var arr = [], newNodes = new Set();
						for(var element of (nodes || this)) {
							var funcCall = element[key1].apply(element, arguments);
							funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
						}
						return (newNodes.size) ? Object.setPrototypeOf([...newNodes], NL) : (arr.length) ? arr : undefined;
					}
				}
			})();
		} catch(e) {
			(function() {
				var key1 = key;
				Object.defineProperty(NL, key, {
					get() {
						var arr = [], nodes = new Set();
						for(var element of this) {
							var prop = element[key1];
							prop instanceof Node ? nodes.add(prop) : arr.push(prop);
						}
						return (nodes.size) ?
						Object.setPrototypeOf([...nodes], NL) :
						(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) ?
						flatten(arr) : arr;
					},
					set(newVal) {
						for(var element of this) element[key1] = newVal;
					}
				});
			})();
		}
	}

	Object.assign(NL, {
		[Symbol.iterator]: Array.prototype[Symbol.iterator],
		forEach: Array.prototype.forEach,
		entries: Array.prototype.entries,
		keys: Array.prototype.keys,
		indexOf: Array.prototype.indexOf,
		lastIndexOf: Array.prototype.lastIndexOf,
		every: Array.prototype.every,
		some: Array.prototype.some,
		reduce: Array.prototype.reduce,
		reduceRight: Array.prototype.reduceRight,
		push: Array.prototype.push,
		pop: Array.prototype.pop,
		shift: Array.prototype.shift,
		unshift: Array.prototype.unshift,
		splice: Array.prototype.splice,
		sort: Array.prototype.sort,
		reverse: Array.prototype.reverse,
		slice(begin, end) {
			return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NL);
		},
		filter(cb) {
			return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NL);
		},
		includes(element) {
			return Array.from(this).indexOf(element) > -1;
		},
		get(prop) {
			var arr = [];
			for(var element of this) arr.push(element[prop]);
			return arr;
		},
		set(prop, value) {
			for(var element of this) element[prop] = value;
		},
		map(cb) {
			var nodes    = Array.prototype.map.call(this, cb);
			var allNodes = nodes.every(function(el) {
				return el instanceof Node;
			});
			if(allNodes) nodes.__proto__ = NL;
			return nodes;
		},
		concat() {
			var nodes = new Set(Array.from(this));
			for(var arg of arguments) {
				if(arg instanceof Node) {
					nodes.add(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
					for(var el of arg) {
						if(el instanceof Node) {
							nodes.add(el);
						} else if(el instanceof NodeList) {
							for(var a of el) nodes.add(a);
						} else {
							throw Error(`${el.constructor.name}: ${el} is not a Node`);
						}
					}
				} else {
					throw Error('Only Node, NodeList, HTMLCollection, or Array');
				}
			}
			return Object.setPrototypeOf([...nodes], this);
		},
		querySelectorAll(selector) {
			var nodes = Array.from(this), newNodes = [];
			for(var node of nodes) newNodes.push(node.querySelectorAll(selector));
			return flatten(newNodes);
		}
	});

	window.$ = function(selector) {
		return Object.setPrototypeOf(Array.from(document.querySelectorAll(selector)), NL);
	}
})();
