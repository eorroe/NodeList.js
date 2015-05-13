(function() {
	NodeList.prototype.__proto__       = Array.prototype;
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
})();