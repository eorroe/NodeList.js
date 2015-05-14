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
		get forEach() { return Array.prototype.forEach.bind(this); },
		get entries() { return Array.prototype.entries.bind(this); },
		get keys() { return Array.prototype.keys.bind(this); },
		get indexOf() { return Array.prototype.indexOf.bind(this); },
		get lastIndexOf() { return Array.prototype.lastIndexOf.bind(this); },
		get every() { return Array.prototype.every.bind(this); },
		get some() { return Array.prototype.some.bind(this); },
		get reduce() { return Array.prototype.reduce.bind(this); },
		get reduceRight() { return Array.prototype.reduceRight.bind(this); },
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
