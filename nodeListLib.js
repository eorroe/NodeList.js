(function() {
	function flatten(arr) {
		var nodes = [];
		for(var i = 0, l = arr.length; i < l; i++) {
			var n = arr[i];
			if(n instanceof Node) {
				nodes.push(n);
			} else if(n instanceof NodeList || n instanceof HTMLCollection || n instanceof Array) {
				for(var i2 = 0, l2 = n.length; i2 < l2; i2++) nodes.push(n[i2]);
			} else {
				return arr;
			}
		}
		nodes.__proto__ = NL;
		return nodes;
	}

	function newArrayMethodError(methodName) {
		return TypeError('The ' + methodName + ' Array Method Does Not Yet Exist In This Browser, NodeList.js Will Automatically Add It When It Does');
	}

	var NL = {
		keys:              Array.prototype.keys,
		entries:           Array.prototype.entries,
		indexOf:           Array.prototype.indexOf,
		lastIndexOf:       Array.prototype.lastIndexOf,
		every:             Array.prototype.every,
		some:              Array.prototype.some,
		reduce:            Array.prototype.reduce,
		reduceRight:       Array.prototype.reduceRight,
		sort:              Array.prototype.sort,
		reverse:           Array.prototype.reverse,
		values:            Array.prototype.values     || newArrayMethodError('values'),
		find:              Array.prototype.find       || newArrayMethodError('find'),
		findIndex:         Array.prototype.findIndex  || newArrayMethodError('findIndex'),
		copyWithin:        Array.prototype.copyWithin || newArrayMethodError('copyWithin'),
		includes:          Array.prototype.includes   || function includes(element, index) {
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
			return this.length;
		},

		pop: function pop(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], pop = Array.prototype.pop.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(pop());
			nodes.__proto__ = NL;
			return nodes;
		},

		unshift: function unshift() {
			var shift = Array.prototype.shift.bind(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(!(arg instanceof Node)) throw Error('Passed arguments must be a Node');
				if(this.indexOf(arg) === -1) shift(arg);
			}
			return this.length;
		},

		shift: function shift(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], shift = Array.prototype.shift.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(shift());
			nodes.__proto__ = NL;
			return nodes;
		},

		splice: function splice() {
			for(var i = 2, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			var nodes = Array.prototype.splice.apply(this, arguments);
			nodes.__proto__ = NL;
			return nodes;
		},

		slice: function slice() {
			var nodes = Array.prototype.slice.apply(this, arguments);
			nodes.__proto__ = NL;
			return nodes;
		},

		filter: function filter() {
			var nodes = Array.prototype.filter.apply(this, arguments);
			nodes.__proto__ = NL;
			return nodes;
		},

		map: function map() {
			var mapped = Array.prototype.map.apply(this, arguments),

			areAllNodes = mapped.every(function(el) {
				return el instanceof Node;
			});

			if(areAllNodes) {
				mapped.__proto__ = NL;
				return mapped;
			}
			mapped.get = NL.get, mapped.set = NL.set, mapped.call = NL.call;
			return mapped;
		},

		concat: function concat() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(arg instanceof Node) {
					if(this.indexOf(arg) === -1) this.push(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
					for(var i2 = 0, l2 = arg.length; i2 < l2; i2++) {
						var el = arg[i2];
						if(el instanceof Node) {
							if(this.indexOf(el) === -1) this.push(el);
						} else if(el instanceof NodeList) {
							for(var i3 = 0, l3 = el.length; i3 < l3; i3++) {
								if(this.indexOf(arg) === -1) this.push(el[i3]);
							}
						} else {
							throw Error(el.constructor.name + ': ' + el + ' is not a Node');
						}
					}
				} else {
					throw Error('Only Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection)');
				}
			}
			return this;
		},

		querySelectorAll: function querySelectorAll(selector) {
			var nodes = [];
			for(var i = 0, l = this.length; i < l; i++) {
				var queriedNodes = this[i].querySelectorAll(selector);
				for(var i2 = 0, l2 = queriedNodes.length; i2 < l2; i2++) nodes.push(queriedNodes[i2]);
			}
			return flatten(nodes);
		},

		get: function get(prop) {
			var arr = [];
			for(var i = 0, l = this.length; i < l; i++) {
				var item = this[i][prop];
				if(item instanceof Node && (arr.indexOf(item) !== -1)) continue;
				arr.push(item);
			}
			arr = flatten(arr);
			arr.get = NL.get, arr.set = NL.set, arr.call = NL.call, arr.owner = this;
			return arr;
		},

		set: function set(prop, value, checkExistence) {
			if(prop.constructor === Object) {
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i];
					for(var p in prop) {
						if(element[p] !== undefined) element[p] = prop[p];
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

		call: function call(method) {
			var argsLength = arguments.length, results = [], args = [], returnResults = false;
			results.get = NL.get, results.set = NL.set, results.call = NL.call, results.owner = this;

			for(var i = 1, l = arguments.length; i < l; i++) args.push(arguments[i]);

			for(var i = 0, l = this.length; i < l; i++) {
				var element = this[i];
				if(element[method] instanceof Function) {
					var funcCall = element[method].apply(element, args);
					results.push(funcCall);
					if(funcCall !== undefined) returnResults = true;
				}
			}
			return returnResults ? results : this;
		}
	}

	if(window.Symbol && window.Symbol.iterator) {
		NL[Symbol.iterator] = NL.values = Array.prototype[Symbol.iterator];
	}

	function setterGetter(prop) {
		if(div[prop] instanceof Function) {
			NL[prop] = NL[prop] || function() {
				var arr = [], nodes = [], arrLength = 0;
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i], funcCall = element[prop].apply(element, arguments);
					if(funcCall instanceof Node) {
						if(nodes.indexOf(funcCall) === -1) nodes.push(funcCall);
					} else if(funcCall !== undefined) {
						arrLength = arr.push(funcCall);
					}
				}
				if(nodes.length) {
					nodes.__proto__ = NL, nodes.owner = this;
					return nodes;
				} else if(arrLength) {
					arr.get = NL.get, arr.set = NL.set, arr.call = NL.call, arr.owner = this;
					return arr;
				}
				return this;
			}
		} else {
			Object.defineProperty(NL, prop, {
				get: function get() {
					var arr = [];
					for(var i = 0, l = this.length; i < l; i++) {
						var item = this[i][prop];
						if(item instanceof Node && (arr.indexOf(item) !== -1)) continue;
						arr.push(item);
					}
					arr = flatten(arr);
					arr.get = NL.get, arr.set = NL.set, arr.call = NL.call, arr.owner = this;
					return arr;
				},
				set: function(newVal) {
					for(var i = 0, l = this.length; i < l; i++) this[i][prop] = newVal;
				}
			});
		}
	}

	var div = document.createElement('div');
	for(var prop in div) setterGetter(prop);
	div = null;

	var getters = [document.querySelectorAll, document.getElementsByName, document.getElementsByClassName, document.getElementsByTagName];

	getters.forEach(function(getter) {
		var oldGetter = getter.bind(document);
		document[getter.name] = function(selector) {
			var nodes = oldGetter(selector), newNodes = [];
			for(var i = 0, l = nodes.length; i < l; i++) newNodes.push(nodes[i]);
			newNodes.__proto__ = NL;
			return newNodes;
		}
		document[getter.name].NL = NL;
	});
})();
