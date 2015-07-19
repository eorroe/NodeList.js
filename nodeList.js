(function() {
	'use strict';
	NodeList.prototype[Symbol.iterator] = HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	function flatten(arr) {
		let nodes = [];
		for(let list of arr) {
			if(list instanceof Array || list instanceof NodeList || list instanceof HTMLCollection) {
				for(let element of list) nodes.push(element);
			} else {
				nodes.push(list);
			}
		}
		return Object.setPrototypeOf(nodes, NL);
	}

	let NL = {};

	for(let key in HTMLElement.prototype) {
		try {
			if(HTMLElement.prototype[key].constructor === Function) {
				NL[key] = function() {
					let arr = [], newNodes = new Set();
					for(let element of this) {
						let funcCall = element[key].apply(element, arguments);
						funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
					}
					if(newNodes.size) {
						let nodes = [];
						for(let node of newNodes) nodes.push(node);
						return Object.setPrototypeOf(nodes, NL);
					} else if(arr.length) {
						return arr;
					}
				}
			}
		} catch(e) {
			Object.defineProperty(NL, key, {
				get: function() {
					let arr = [], nodes = new Set();
					for(let element of this) {
						let prop = element[key];
						prop instanceof Node ? nodes.add(prop) : arr.push(prop);
					}
					if(nodes.size) {
						let newNodes = [];
						for(let node of nodes) newNodes.push(node);
						return Object.setPrototypeOf(newNodes, NL);
					} else if(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) {
						return flatten(arr);
					} else {
						return arr;
					}
				},
				set: function(newVal) {
					for(let element of this) element[key] = newVal;
				}
			});
		}
	}

	NL[Symbol.iterator] = Array.prototype[Symbol.iterator];
	NL.keys             = Array.prototype.keys;
	NL.values           = Array.prototype.values;
	NL.entries          = Array.prototype.entries;
	NL.indexOf          = Array.prototype.indexOf;
	NL.lastIndexOf      = Array.prototype.lastIndexOf;
	NL.forEach          = Array.prototype.forEach;
	NL.every            = Array.prototype.every;
	NL.some             = Array.prototype.some;
	NL.reduce           = Array.prototype.reduce;
	NL.reduceRight      = Array.prototype.reduceRight;
	NL.push             = Array.prototype.push;
	NL.pop              = Array.prototype.pop;
	NL.shift            = Array.prototype.shift;
	NL.unshift          = Array.prototype.unshift;
	NL.splice           = Array.prototype.splice;
	NL.sort             = Array.prototype.sort;
	NL.reverse          = Array.prototype.reverse;
	NL.includes         = Array.prototype.includes || function includes(element) {
		return this.indexOf(element) > -1;
	}

	if(Array.prototype.find)       NL.find       = Array.prototype.find
	if(Array.prototype.findIndex)  NL.findIndex  = Array.prototype.findIndex
	if(Array.prototype.copyWithin) NL.copyWithin = Array.prototype.copyWithin

	NL.slice = function slice(begin, end) {
		return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NL);
	}

	NL.filter = function filter(cb) {
		return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NL);
	}

	NL.map = function map(cb) {
		let nodes = Array.prototype.map.call(this, cb),

		areAllNodes = nodes.every(function(el) {
			return el instanceof Node;
		});

		if(areAllNodes) Object.setPrototypeOf(nodes, NL);
		return nodes;
	}

	NL.concat = function concat() {
		let nodes = new Set(this);
		for(let i = 0, l = arguments.length; i < l; i++) {
			arg = arguments[i];
			if(arg instanceof Node) {
				nodes.add(arg);
			} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
				for(let el of arg) {
					if(el instanceof Node) {
						nodes.add(el);
					} else if(el instanceof NodeList) {
						for(let a of el) nodes.add(a);
					} else {
						throw Error(el.constructor.name + ': ' + el + ' is not a Node');
					}
				}
			} else {
				throw Error('Only Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection)');
			}
		}
		let newNodes = [];
		for(let node of nodes) newNodes.push(node);
		return Object.setPrototypeOf(newNodes, this);
	}

	NL.querySelectorAll = function querySelectorAll(selector) {
		let newNodes = [];
		for(let node of this) {
			let nodes = [];
			for(let n of node.querySelectorAll(selector)) nodes.push(n);
			newNodes.push(nodes);
		}
		return flatten(newNodes);
	}

	NL.get = function get(prop) {
		let arr = [];
		for(let element of this) arr.push(element[prop]);
		return arr;
	}

	NL.set = function set(prop, value) {
		for(let element of this) element[prop] = value;
	}

	window.$ = function(selector) {
		let nodes = [];
		for(let node of document.querySelectorAll(selector)) nodes.push(node);
		return Object.setPrototypeOf(nodes, NL);
	}

	window.$.NL = NL;
})();
