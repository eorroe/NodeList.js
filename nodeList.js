(function() {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype.__proto__ = NodeList.prototype;

	for(var key in HTMLElement.prototype) {
		try {
			(function() {
				if(HTMLElement.prototype[key].constructor == Function) {
					var key1 = key;
					NodeList.prototype[key] = function() {
						var arr = [], nodes = [];
						for(var element of this) {
							var funcCall = HTMLElement.prototype[key1].apply(element, arguments);
							funcCall instanceof Node ? nodes.push(funcCall) : funcCall ? arr.push(funcCall) : null;
						}
						if(nodes.length) {
							nodes.__proto__ = NodeList.prototype;
							return nodes;
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
							prop instanceof Node ? nodes.push(prop) : prop ? arr.push(prop) : null;
						}
						if(nodes.length) {
							nodes.__proto__ = NodeList.prototype;
							return nodes;
						}
						return arr;
					},
					set(newVal) {
						for(var element of this) element[key1] = newVal;
					}
				});
			})();
		}
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
			var nodes       = Array.prototype.slice.call(this, begin, end);
			nodes.__proto__ = NodeList.prototype;
			return nodes;
		},
		map(cb) {
			var nodes    = Array.prototype.map.call(this, cb);
			var allNodes = nodes.every(function(el) {
				return el instanceof Node;
			});
			if(allNodes) nodes.__proto__ = NodeList.prototype;
			return nodes;
		},
		filter(cb) {
			var nodes       = Array.prototype.filter.call(this, cb);
			nodes.__proto__ = NodeList.prototype;
			return nodes;
		}
	}
})();
