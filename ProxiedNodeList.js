(function() {
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

	var NL = {
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
			return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), this);
		},
		filter(cb) {
			return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), this);
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
			if(allNodes) nodes.__proto__ = this;
			return nodes;
		},
		concat() {
			var nodes = new Set(Array.from(this));
			for(var arg of arguments) {
				if(arg instanceof Node) {
					nodes.add(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array) {
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
	}

	document.querySelectorAll = function(selector) {
		var nodes = Object.setPrototypeOf(Array.from(Document.prototype.querySelectorAll.call(document, selector)), NL);
		nodes[Symbol.iterator] = Array.prototype[Symbol.iterator];
		return new Proxy(nodes, {
			get(target, property) {
				if(target[property] !== undefined) return target[property];
				try {
					if(HTMLElement.prototype[property].constructor == Function) {
						return function() {
							if(property == 'remove') var nodes = Array.from(target);
							var arr = [], newNodes = new Set();
							for(var element of (nodes || target)) {
								var funcCall = element[property].apply(element, arguments);
								funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
							}
							return (newNodes.size) ? Object.setPrototypeOf([...newNodes], NodeList.prototype) : (arr.length) ? arr : undefined;
						}
					}
				} catch(e) {
					var arr = [], newNodes = new Set();
					for(var element of target) {
						var prop = element[property];
						prop instanceof Node ? newNodes.add(prop) : (prop !== undefined) ? arr.push(prop) : null;
					}
					return (newNodes.size) ?
					Object.setPrototypeOf([...newNodes], NL) :
					(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) ?
					flatten(arr) : (arr.length) ? arr : undefined;
				}
			},
			set(target, prop, value) {
				for(var element of target) {
					if(prop in element) element[prop] = value;
				}
			}
		});
	}
})();

var $ = document.querySelectorAll.bind(document);
console.log($('div').textContent);
