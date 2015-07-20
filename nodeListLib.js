(function() {
	'use strict';
	function flatten(arr) {
		var nodes = [];
		for(var i = 0, l = arr.length; i < l; i++) {
			var n = arr[i];
			if(n instanceof Node) {
				nodes.push(n);
			} else {
				for(var i2 = 0, l2 = n.length; i2 < l2; i2++) nodes.push(n[i2]);
			}
		}
		return Object.setPrototypeOf(nodes, NL.prototype);
	}

	var NL = function(selector) {
		var nodes = document.querySelectorAll(selector);
		for(var i = 0, l = this.length = nodes.length; i < l; i++) this[i] = nodes[i];
	}


	function setterGetter(key) {
		try {
			if(HTMLElement.prototype[key].constructor === Function) {
				NL.prototype[key] = function() {
					var arr = [], newNodes = new Set();
					for(var i = 0, l = this.length; i < l; i++) {
						var element = this[i];
						var funcCall = element[key].apply(element, arguments);
						funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
					}
					if(newNodes.size) {
						var nodes = [];
						newNodes.forEach(function(node) {
							nodes.push(node);
						});
						return Object.setPrototypeOf(nodes, NL.prototype);
					} else if(arr.length) {
						return arr;
					}
					return this;
				}
			}
		} catch(e) {
			Object.defineProperty(NL.prototype, key, {
				get: function() {
					var arr = [], nodes = new Set();
					for(var i = 0, l = this.length; i < l; i++) {
						var prop = this[i][key];
						prop instanceof Node ? nodes.add(prop) : arr.push(prop);
					}
					if(nodes.size) {
						var newNodes = [];
						nodes.forEach(function(node) {
							newNodes.push(node);
						});
						return Object.setPrototypeOf(newNodes, NL.prototype);
					} else if(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) {
						return flatten(arr);
					}
					return arr;
				},
				set: function(newVal) {
					for(var i = 0, l = this.length; i < l; i++) this[i][key] = newVal;
				}
			});
		}
	}

	for(var key in HTMLElement.prototype) setterGetter(key);

	NL.prototype.keys        = Array.prototype.keys;
	NL.prototype.values      = Array.prototype.values;
	NL.prototype.entries     = Array.prototype.entries;
	NL.prototype.indexOf     = Array.prototype.indexOf;
	NL.prototype.lastIndexOf = Array.prototype.lastIndexOf;
	NL.prototype.every       = Array.prototype.every;
	NL.prototype.some        = Array.prototype.some;
	NL.prototype.reduce      = Array.prototype.reduce;
	NL.prototype.reduceRight = Array.prototype.reduceRight;
	NL.prototype.pop         = Array.prototype.pop;
	NL.prototype.shift       = Array.prototype.shift;
	NL.prototype.sort        = Array.prototype.sort;
	NL.prototype.reverse     = Array.prototype.reverse;
	NL.prototype.includes    = Array.prototype.includes || function includes(element) {
		return this.indexOf(element) > -1;
	}

	NL.prototype.forEach = function() {
		Array.prototype.forEach.apply(this, arguments);
		return this;
	}

	NL.prototype.push = function() {
		for(var i = 0, l = arguments.length; i < l; i++) {
			if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
		}
		return Array.prototype.push.apply(this, arguments);
	}

	NL.prototype.unshift = function() {
		for(var i = 0, l = arguments.length; i < l; i++) {
			if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
		}
		return Array.prototype.unshift.apply(this, arguments);
	}

	NL.prototype.splice = function() {
		for(var i = 2, l = arguments.length; i < l; i++) {
			if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
		}
		return Array.prototype.splice.apply(this, arguments);
	}

	NL.prototype.slice = function slice(begin, end) {
		return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NL.prototype);
	}

	NL.prototype.filter = function filter(cb) {
		return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NL.prototype);
	}

	NL.prototype.map = function map(cb) {
		var nodes = Array.prototype.map.call(this, cb),

		areAllNodes = nodes.every(function(el) {
			return el instanceof Node;
		});

		if(areAllNodes) Object.setPrototypeOf(nodes, NL.prototype);
		return nodes;
	}

	NL.prototype.concat = function concat() {
		var nodes = new Set(this);
		for(var i = 0, l = arguments.length; i < l; i++) {
			var arg = arguments[i];
			if(arg instanceof Node) {
				nodes.add(arg);
			} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL.prototype) {
				for(var i2 = 0, l2 = arg.length; i2 < l2; i2++) {
					el = arg[i2];
					if(el instanceof Node) {
						nodes.add(el);
					} else if(el instanceof NodeList) {
						for(var i3 = 0, l3 = el.length; i3 < l3; i3++) nodes.add(el[i3]);
					} else {
						throw Error(el.constructor.name + ': ' + el + ' is not a Node');
					}
				}
			} else {
				throw Error('Only Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection)');
			}
		}
		var newNodes = [];
		nodes.forEach(function(node) {
			newNodes.push(node);
		});
		return Object.setPrototypeOf(newNodes, this);
	}

	NL.prototype.querySelectorAll = function querySelectorAll(selector) {
		var newNodes = [];
		for(var i = 0, l = this.length; i < l; i++) {
			var nodes = [], queriedNodes = this[i].querySelectorAll(selector);
			for(var i2 = 0, l2 = queriedNodes.length; i2 < l2; i2++) nodes.push(queriedNodes[i2]);
			newNodes.push(nodes);
		}
		return flatten(newNodes);
	}

	NL.prototype.get = function get(property) {
		var arr = [], nodes = new Set();
		for(var i = 0, l = this.length; i < l; i++) {
			var prop = this[i][property];
			prop instanceof Node ? nodes.add(prop) : arr.push(prop);
		}
		if(nodes.size) {
			var newNodes = [];
			nodes.forEach(function(node) {
				newNodes.push(node);
			});
			return Object.setPrototypeOf(newNodes, NL.prototype);
		} else if(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) {
			return flatten(arr);
		}
		return arr;
	}

	NL.prototype.set = function set(prop, value, checkIfExist) {
		if(checkIfExist) {
			for(var i = 0, l = this.length; i < l; i++) {
				var element = this[i];
				if(element[prop] !== undefined) element[prop] = vlue;
			}
		} else {
			for(var i = 0, l = this.length; i < l; i++) this[i][prop] = value;
		}
		return this;
	}

	if(Array.prototype.find)       NL.prototype.find       = Array.prototype.find;
	if(Array.prototype.findIndex)  NL.prototype.findIndex  = Array.prototype.findIndex;
	if(Array.prototype.copyWithin) NL.prototype.copyWithin = Array.prototype.copyWithin;

	window.$ = function(selector) {
		return new NL(selector);
	}
	window.$.NL = NL.prototype;
})();
