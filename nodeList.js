(function() {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
	HTMLCollection.prototype.__proto__ = NodeList.prototype;

	for(var key in HTMLElement.prototype) {
		try {
			(function() {
				if(HTMLElement.prototype[key].constructor == Function) {
					var key1 = key;
					NodeList.prototype[key] = function() {
						var arr = [], fragment = document.createDocumentFragment();
						for(var element of this) {
							var funcCall = HTMLElement.prototype[key1].apply(element, arguments);
							funcCall instanceof Node ? fragment.appendChild(funcCall.cloneNode(true)) : (funcCall !== undefined) ? arr.push(funcCall) : null;
						}
						return fragment.childNodes.length ? fragment.childNodes : arr.length ? arr : undefined;
					}
				}
			})();
		} catch(e) {
			(function() {
				var key1 = key;
				Object.defineProperty(NodeList.prototype, key, {
					get() {
						var arr = [], fragment = document.createDocumentFragment();
						for(var element of this) {
							var prop = element[key1];
							prop instanceof Node ? fragment.appendChild(prop.cloneNode(true)) : prop ? arr.push(prop) : null;
						}
						return fragment.childNodes.length ? fragment.childNodes : arr.length ? arr : arr;
					},
					set(newVal) {
						for(var element of this) element[key1] = newVal;
					}
				});
			})();
		}
	}

	function toNodeList(elements) {
		var fragment = document.createDocumentFragment();
		for(var el of elements) fragment.appendChild(el.cloneNode(true));
		return fragment.childNodes;
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
			return toNodeList(Array.prototype.slice.call(this, begin, end));
		},
		map(cb) {
			var arr = Array.prototype.map.call(this, cb);
			var allNodes = arr.every(function(el) {
				return el instanceof Node;
			});
			return allNodes ? toNodeList(arr) : arr;
		},
		filter(cb) {
			return toNodeList(Array.prototype.filter.call(this, cb));
		}
	}
})();
