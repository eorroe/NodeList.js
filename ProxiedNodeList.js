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
		return proxyNodeList(Object.setPrototypeOf(nodes, NL));
	}

	var NL = {
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
			return Object.setPrototypeOf(Array.prototype.slice.call(this, begin, end), NL);
		},
		filter(cb) {
			return Object.setPrototypeOf(Array.prototype.filter.call(this, cb), NL);
		},
		map(cb) {
			let nodes = Array.prototype.map.call(this, cb);
			if(nodes.every(el => el instanceof Node)) Object.setPrototypeOf(nodes, NL);
			return nodes;
		},
		concat(...args) {
			let nodes = new Set(this);
			for(let arg of args) {
				if(arg instanceof Node) {
					nodes.add(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
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
			return [for(element of this) element[prop]];
		},
		set(prop, value) {
			for(let element of this) element[prop] = value;
		},
		querySelectorAll(selector) {
			return flatten([for(node of this) node.querySelectorAll(selector)]);
		}
	}

	function proxyNodeList(nodeList) {
		return new Proxy(nodeList, {
			get(target, property) {
				if(target[property] !== undefined) return target[property];
				try {
					if(HTMLElement.prototype[property].constructor == Function) {
						return function(...args) {
							let nodeList = (property === 'remove') ? Array.from(target) : undefined; // done because of NodeList being live
							let arr = [], newNodes = new Set();
							for(let element of (nodeList || target)) {
								let funcCall = element[property](...args);
								funcCall instanceof Node ? newNodes.add(funcCall) : funcCall !== undefined ? arr.push(funcCall) : null;
							}
							return (newNodes.size) ? proxyNodeList(Object.setPrototypeOf([...newNodes], NL)) : (arr.length) ? arr : undefined;
						}
					}
				} catch(e) {
					let arr = [], newNodes = new Set();
					for(let element of target) {
						let prop = element[property];
						prop instanceof Node ? newNodes.add(prop) : (prop !== undefined) ? arr.push(prop) : null;
					}
					return (newNodes.size) ?
					proxyNodeList(Object.setPrototypeOf([...newNodes], NL)) :
					(arr[0] instanceof NodeList || arr[0] instanceof HTMLCollection) ?
					flatten(arr) : (arr.length) ? arr : undefined;
				}
			},
			set(target, prop, value) {
				for(let element of target) {
					if(prop in element) if(element[prop] !== undefined) element[prop] = value;
				}
			}
		});
	}

	document.querySelectorAll = function(selector) {
		let nodes = Array.from(Document.prototype.querySelectorAll.call(document, selector));
		Object.setPrototypeOf(nodes, NL);
		return proxyNodeList(nodes);
	}
})();
