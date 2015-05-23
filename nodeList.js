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
										var funcCall = element[key1].apply(element, arguments);
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
										prop instanceof Node ? nodes.push(prop) : arr.push(prop);
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
						nodes.__proto__ = NodeList.prototype;
						return nodes;
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
					}
				}
			})();
