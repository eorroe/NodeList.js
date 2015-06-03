(function() {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype.__proto__  = NodeList.prototype;

	for(var key in HTMLElement.prototype) {
		try {
			(function() {
				if(HTMLElement.prototype[key].constructor == Function) {
					var key1 = key;
					NodeList.prototype[key] = function() {
						if(key1 == 'remove') var nodes = Array.prototype.slice.call(this);
						var arr = [], newNodes = [];
						for(var element of (nodes || this)) {
							var funcCall = element[key1].apply(element, arguments);
							funcCall instanceof Node ? newNodes.push(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
						}
						if(newNodes.length) {
							return Object.setPrototypeOf(newNodes, NodeList.prototype);
						} else if(arr.length) {
							return arr;
						}
					}
				}
			})();
		} catch(e) {
			(function() {
				var key1 = key;
				Object.defineProperty(NodeList.prototype, key, {
					get() {
						var arr = [], nodes = [];
						for(var element of this) {
							var prop = element[key1];
							prop instanceof Node ? nodes.push(prop) : arr.push(prop);
						}
						return (nodes.length) ?
						Object.setPrototypeOf(nodes, NodeList.prototype) :
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

	NodeList.prototype.querySelectorAll = function(selector) {
		var nodes = Array.prototype.slice.call(this), newNodes = [];
		for(var node of nodes) newNodes.push(node.querySelectorAll(selector));
		return flatten(newNodes);
	}

	function flatten(arr) {
		var nodes = [];
		for(var list of arr) {
			if(list instanceof Array || list instanceof NodeList || list instanceof HTMLCollection) {
				for(var element of list) nodes.push(element);
			} else {
				nodes.push(list);
			}
		}
		return Object.setPrototypeOf(nodes, NodeList.prototype);
	}

	NodeList.prototype.__proto__ = {
		forEach: Array.prototype.forEach,
		entries: Array.prototype.entries,
		keys: Array.prototype.keys,
		indexOf: Array.prototype.indexOf,
		lastIndexOf: Array.prototype.lastIndexOf,
		every: Array.prototype.every,
		some: Array.prototype.some,
		reduce: Array.prototype.reduce,
		reduceRight: Array.prototype.reduceRight,
		slice(begin, end) {
			return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NodeList.prototype);
		},
		filter(cb) {
			return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NodeList.prototype);
		},
		includes(element) {
			return Array.prototype.slice.call(this).indexOf(element) > -1;
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
			if(allNodes) nodes.__proto__ = NodeList.prototype;
			return nodes;
		},
		concat() {
			var nodes = Array.prototype.slice.call(this);
			for(var arg of arguments) {
				if(arg instanceof Node) {
					nodes.push(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array) {
					for(var el of arg) {
						if(el instanceof Node) {
							nodes.push(el);
						} else if(el instanceof NodeList) {
							for(var a of el) nodes.push(a);
						} else {
							throw Error(`${el.constructor.name}: ${el} is not a Node`);
						}
					}
				} else {
					throw Error('Only Node, NodeList, HTMLCollection, or Array');
				}
			}
			return Object.setPrototypeOf(nodes, NodeList.prototype);
		}
	}
})();
