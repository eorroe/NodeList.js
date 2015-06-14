(function() {
	'use strict';
	function flatten(arr) {
		let nodes = [];
		for(let list of arr) {
			if(list instanceof Array || list instanceof NodeList || list instanceof HTMLCollection) {
				for(let element of Array.from(list)) nodes.push(element);
			} else {
				nodes.push(list);
			}
		}
		return Object.setPrototypeOf(nodes, NodeList.prototype);
	}

	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype.__proto__  = NodeList.prototype;


	for(let key in HTMLElement.prototype) {
		try {
			if(HTMLElement.prototype[key].constructor === Function) {
				NodeList.prototype[key] = function() {
					let nodes = (key === 'remove') ? Array.from(this) : undefined;
					let arr = [], newNodes = new Set();
					for(let element of (nodes || this)) {
						let funcCall = element[key].apply(element, arguments);
						funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
					}
					return (newNodes.size) ? Object.setPrototypeOf([...newNodes], NodeList.prototype) : (arr.length) ? arr : undefined;
				}
			}
		} catch(e) {
			Object.defineProperty(NodeList.prototype, key, {
				get() {
					let arr = [], nodes = new Set();
					for(let element of this) {
						let prop = element[key];
						prop instanceof Node ? nodes.add(prop) : arr.push(prop);
					}
					return (nodes.size) ? Object.setPrototypeOf([...nodes], NodeList.prototype) :
					(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) ?
					flatten(arr) : arr;
				},
				set(newVal) {
					for(let element of this) element[key] = newVal;
				}
			});
		}
	}

	NodeList.prototype.__proto__ = {
		[Symbol.iterator]: Array.prototype[Symbol.iterator],
		entries     : Array.prototype.entries,
		keys        : Array.prototype.keys,
		values      : Array.prototype.values,
		forEach     : Array.prototype.forEach,
		indexOf     : Array.prototype.indexOf,
		lastIndexOf : Array.prototype.lastIndexOf,
		every       : Array.prototype.every,
		some        : Array.prototype.some,
		reduce      : Array.prototype.reduce,
		reduceRight : Array.prototype.reduceRight,
		push        : Array.prototype.push,
		pop         : Array.prototype.pop,
		shift       : Array.prototype.shift,
		unshift     : Array.prototype.unshift,
		splice      : Array.prototype.splice,
		sort        : Array.prototype.sort,
		reverse     : Array.prototype.reverse,
		find        : Array.prototype.find,
		findIndex   : Array.prototype.findIndex,
		copyWithin  : Array.prototype.copyWithin,
		includes    : Array.prototype.includes,
		slice(begin, end) {
			return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NodeList.prototype);
		},
		filter(cb) {
			return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NodeList.prototype);
		},
		map(cb) {
			let nodes = Array.prototype.map.call(this, cb);
			if(nodes.every(el => el instanceof Node)) Object.setPrototypeOf(nodes, NodeList.prototype);
			return nodes;
		},
		concat() {
			let nodes = new Set(this);
			for(let arg of arguments) {
				if(arg instanceof Node) {
					nodes.add(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NodeList.prototype) {
					for(let el of arg) {
						if(el instanceof Node) {
							nodes.add(el);
						} else if(el instanceof NodeList) {
							for(let a of el) nodes.add(a);
						} else {
							throw Error(`${el.constructor.name}: ${el} is not a Node`);
						}
					}
				} else {
					throw Error('Only Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection)');
				}
			}
			return Object.setPrototypeOf([...nodes], this);
		},
		// Delete once native Array.protototype.includes exist
		includes(element) {
			return this.indexOf(element) > -1;
		},
		get(prop) {
			let arr = [];
			for(let element of this) arr.push(element[prop]);
			return arr;
			// ES7 Array Comprehensions
			// return [for(let element of this) element[prop]];
		},
		set(prop, value) {
			for(let element of this) element[prop] = value;
		},
		querySelectorAll(selector) {
			let newNodes = [];
			for(let node of this) newNodes.push(node.querySelectorAll(selector));
			return flatten(newNodes);
			// ES7 Array Comprehensions
			// return flatten([for(let node of this) node.querySelectorAll(selector)]);
		}
	}
})();
$ = document.querySelectorAll.bind(document);
