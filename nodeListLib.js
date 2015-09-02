(function() {
	function flatten(arr, owner) {
		var elms = [];
		for(var i = 0, l = arr.length; i < l; i++) {
			var el = arr[i];
			if(el instanceof Node) {
				elms.push(el);
			} else if(el instanceof NodeList || el instanceof HTMLCollection || el instanceof Array) {
				elms = elms.concat(flatten(el));
			} else {
				arr.get = NL.get, arr.set = NL.set, arr.call = NL.call, arr.owner = owner;
				return arr;
			}
		}
		elms.__proto__ = NL, elms.owner = owner;
		return elms;
	}

	var NL = {
		includes: Array.prototype.includes || function includes(element, index) {
			return this.indexOf(element, index) > -1;
		},

		forEach: function forEach() {
			Array.prototype.forEach.apply(this, arguments);
			return this;
		},

		push: function push() {
			var push = Array.prototype.push.bind(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(!(arg instanceof Node)) throw Error('Passed arguments must be a Node');
				if(this.indexOf(arg) === -1) push(arg);
			}
			return this;
		},

		pop: function pop(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], pop = Array.prototype.pop.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(pop());
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		},

		unshift: function unshift() {
			var unshift = Array.prototype.unshift.bind(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(!(arg instanceof Node)) throw Error('Passed arguments must be a Node');
				if(this.indexOf(arg) === -1) unshift(arg);
			}
			return this;
		},

		shift: function shift(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], shift = Array.prototype.shift.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(shift());
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		},

		splice: function splice() {
			for(var i = 2, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			var nodes = Array.prototype.splice.apply(this, arguments);
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		},

		slice: function slice() {
			var nodes = Array.prototype.slice.apply(this, arguments);
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		},

		filter: function filter() {
			var nodes = Array.prototype.filter.apply(this, arguments);
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		},

		map: function map(cb, context) {
			var elems = [], areAllNodes = true;
			for(var i = 0, l = this.length; i < l; i++) {
				var funcCall = cb.call(context, this[i], i, this);
				if( !(funcCall instanceof Node) ) areAllNodes = false;
			}
			if(areAllNodes) return flatten(mapped);
			return flatten(mapped, this);
		},

		concat: function concat() {
			var nodes = flatten(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(arg instanceof Node) {
					if(nodes.indexOf(arg) === -1) nodes.push(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
					nodes = nodes.concat.apply(nodes, arg);
				} else {
					throw Error('Concat only takes a Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)');
				}
			}
			nodes.owner = this;
			return nodes;
		},

		get: function get(prop) {
			var arr = [];
			for(var i = 0, l = this.length; i < l; i++) {
				var item = this[i][prop];
				if(item instanceof Node && (arr.indexOf(item) !== -1)) continue;
				arr.push(item);
			}
			return flatten(arr, this);
		},

		set: function set(prop, value, checkExistence) {
			if(prop.constructor === Object) {
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i];
					for(var key in prop) {
						if(element[key] !== undefined) element[key] = prop[key];
					}
				}
			} else if(checkExistence) {
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i];
					if(element[prop] !== undefined) element[prop] = value;
				}
			} else {
				for(var i = 0, l = this.length; i < l; i++) this[i][prop] = value;
			}
			return this;
		},

		call: function call() {
			var arr = [], nodes = [], method = Array.prototype.shift.call(arguments);
			for(var i = 0, l = this.length; i < l; i++) {
				var element = this[i];
				if(element[method] instanceof Function) {
					var funcCall = element[method].apply(element, arguments);
					if(funcCall instanceof Node && nodes.indexOf(funcCall) === -1) {
						nodes.push(funcCall);
					} else if(funcCall !== undefined) {
						arr.push(funcCall);
					}
				}
			}
			if(nodes[0]) {
				nodes.__proto__ = NL, nodes.owner = this;
				return nodes;
			} else if(arr[0] !== undefined) {
				return flatten(arr, this);
			}
			return this;
		},

		item: function(index) {
			var nodes = [this[index]];
			nodes.__proto__ = NL, nodes.owner = this;
			return nodes;
		}
	}

	var arrProps = ['join', 'copyWithin', 'fill'];
	Object.getOwnPropertyNames(Array.prototype).forEach(function(key) {
		if(arrProps.indexOf(key) === -1 && NL[key] === undefined) NL[key] = Array.prototype[key];
	});

	if(Symbol && Symbol.iterator) NL[Symbol.iterator] = NL.values = Array.prototype[Symbol.iterator];

	function setterGetter(prop) {
		if(div[prop] instanceof Function) {
			NL[prop] = NL[prop] || function() {
				var arr = [], nodes = [];
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i], funcCall = element[prop].apply(element, arguments);
					if(funcCall instanceof Node && nodes.indexOf(funcCall) === -1) {
						nodes.push(funcCall);
					} else if(funcCall !== undefined) {
						arr.push(funcCall);
					}
				}
				if(nodes[0]) {
					nodes.__proto__ = NL, nodes.owner = this;
					return nodes;
				} else if(arr[0] !== undefined) {
					return flatten(arr, this);
				}
				return this;
			}
		} else {
			Object.defineProperty(NL, prop, {
				get: function get() {
					var arr = [];
					for(var i = 0, l = this.length; i < l; i++) {
						var item = this[i][prop];
						if(item instanceof Node && arr.indexOf(item) !== -1) continue;
						arr.push(item);
					}
					return flatten(arr, this);
				},
				set: function(newVal) {
					for(var i = 0, l = this.length; i < l; i++) this[i][prop] = newVal;
				}
			});
		}
	}

	var div = document.createElement('div');
	for(var prop in div) setterGetter(prop);
	arrProps = div = null;

	window.$$ = function NodeListJS(selector, scope) {
		var nodes = (scope || document).querySelectorAll(selector), newNodes = [];
		for(var i = 0, l = nodes.length; i < l; i++) newNodes.push(nodes[i]);
		newNodes.__proto__ = NL;
		return newNodes;
	}
	window.$$.NL = NL;
})();
