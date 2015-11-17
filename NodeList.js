( function() {
	var ArrayProto = Array.prototype, nodeError = new Error( 'Passed arguments must be of Node' ), NL, div, prop;
	function flatten( arr, owner ) {
		var elms = [], i = 0, l = arr.length, i2, l2, el;
		for( ; i < l; i++ ) {
			el = arr[ i ];
			if( el instanceof Node || el == null ) {
				if( elms.indexOf( el ) < 0 ) elms.push( el );
			} else if( el instanceof window.NodeList || el instanceof NodeList || el instanceof HTMLCollection || el instanceof Array ) {
				for( i2 = 0, l2 = el.length; i2 < l2; i2++ ) elms.push( el[i2] );
			} else {
				arr.get = NL.get; arr.set = NL.set; arr.call = NL.call; arr.owner = owner;
				return arr;
			}
		}
		return new NodeList( [ elms, owner ] );
	}
	function NodeList( args ) {
		var i = 0, l, nodes = args;
		if( typeof args[0] === 'string' ) {
			nodes = ( args[1] || document ).querySelectorAll( args[0] );
		} else if( 0 in args && !( args[0] instanceof Node ) && 'length' in args[0] ) {
			nodes = args[0];
			if( args[1] ) this.owner = args[1];
		}
		for( l = this.length = nodes.length; i < l; i++ ) this[ i ] = nodes[ i ];
	}
	NL = NodeList.prototype = {
		includes: ArrayProto.includes || function includes( element, index ) {
			return this.indexOf( element, index ) > -1;
		},
		forEach: function forEach() {
			ArrayProto.forEach.apply( this, arguments );
			return this;
		},
		push: function push() {
			var push = ArrayProto.push.bind( this ), i = 0, l = arguments.length, arg;
			for( ; i < l; i++ ) {
				arg = arguments[ i ];
				if( !( arg instanceof Node ) ) throw nodeError;
				if( this.indexOf( arg ) < 0 ) push( arg );
			}
			return this;
		},
		pop: function pop( amount ) {
			if( typeof amount !== "number" ) amount = 1;
			var nodes = [], pop = ArrayProto.pop.bind( this ), i;
			for( i = 0; i < amount; i++ ) nodes.push( pop() );
			return new NodeList( [nodes, this] );
		},
		unshift: function unshift() {
			var unshift = ArrayProto.unshift.bind( this ), i = 0, l = arguments.length, arg;
			for( ; i < l; i++ ) {
				arg = arguments[ i ];
				if( !( arg instanceof Node ) ) throw nodeError;
				if( this.indexOf(arg) < 0 ) unshift( arg );
			}
			return this;
		},
		shift: function shift( amount ) {
			if( typeof amount !== "number" ) amount = 1;
			var nodes = [], shift = ArrayProto.shift.bind( this ), i;
			for( i = 0; i < amount; i++ ) nodes.push( shift() );
			return new NodeList( [ nodes, this ] );
		},
		splice: function splice() {
			for( var i = 2, l = arguments.length; i < l; i++ ) {
				if( !( arguments[ i ] instanceof Node ) ) throw nodeError;
			}
			return new NodeList( [ ArrayProto.splice.apply( this, arguments ), this ] );
		},
		slice: function slice() {
			return new NodeList( [ ArrayProto.slice.apply( this, arguments ), this ] );
		},
		filter: function filter() {
			return new NodeList( [ ArrayProto.filter.apply( this, arguments ), this ] );
		},
		map: function map() {
			return flatten( ArrayProto.map.apply( this, arguments ), this );
		},
		concat: function concat() {
			var nodes = ArrayProto.slice.call(this), i = 0, l = arguments.length, arg;
			function flatten( arr ) {
				for( var i = 0, l = arr.length; i < l; i++ ) {
					if( arr[ i ] instanceof Node ) {
						if( nodes.indexOf( arr[ i ] ) < 0 ) nodes.push( arr[ i ] );
					} else if( arr[ i ] ) {
						flatten( arr[ i ] );
					}
				}
			}
			for( ; i < l; i++ ) {
				arg = arguments[i];
				if( arg instanceof Node ) {
					if( nodes.indexOf( arg ) < 0 ) nodes.push( arg );
				} else if( arg instanceof window.NodeList || arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array ) {
					flatten( arg );
				} else {
					throw Error( 'Concat arguments must be of a Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)' );
				}
			}
			return new NodeList( [ nodes, this ] );
		},
		get: function get( prop ) {
			var arr = [], i = 0, l = this.length, el;
			for( ; i < l; i++ ) {
				el = this[ i ];
				if( el != null ) el = el[prop];
				arr.push( el );
			}
			return flatten( arr, this );
		},
		set: function set( prop, value ) {
			var i = 0, l = this.length, el, key;
			if( prop.constructor === Object ) {
				for( ; i < l; i++ ) {
					el = this[ i ];
					if( el ) {
						for( key in prop ) {
							if( key in el ) el[ key ] = prop[ key ];
						}
					}
				}
			} else {
				for( ; i < l; i++ ) {
					el = this[ i ];
					if( el && prop in el ) el[ prop ] = value;
				}
			}
			return this;
		},
		call: function call() {
			var arr = [], method = ArrayProto.shift.call( arguments ), returnThis = true, i = 0, l = this.length, el;
			for( ; i < l; i++ ) {
				el = this[ i ];
				if( el && el[ method ] instanceof Function ) {
					el = el[ method ].apply( el, arguments );
					arr.push( el );
					if( returnThis && el !== undefined ) returnThis = false;
				} else {
					arr.push( undefined );
				}
			}
			return returnThis ? this : flatten( arr, this );
		},
		item: function( index ) {
			return new NodeList( [ [ this[ index ] ], this ] );
		},
		get asArray() {
			return ArrayProto.slice.call( this );
		}
	}
	Object.getOwnPropertyNames( ArrayProto ).forEach( function( key ) {
		if( key !== 'join' && key !== 'copyWithin' && key !== 'fill' && NL[ key ] === undefined ) {
			NL[ key ] = ArrayProto[ key ];
		}
	});
	if( window.Symbol && Symbol.iterator ) NL[ Symbol.iterator ] = NL.values = ArrayProto[ Symbol.iterator ];
	function setterGetter( prop ) {
		if( div[ prop ] instanceof Function ) {
			NL[ prop ] = function() {
				var arr = [], returnThis = true, i = 0, l = this.length, el;
				for( ; i < l; i++ ) {
					el = this[ i ];
					if( el && el[ prop ] instanceof Function ) {
						el = el[ prop ].apply( el, arguments );
						arr.push( el );
						if( returnThis && el !== undefined ) returnThis = false;
					} else {
						arr.push( undefined );
					}
				}
				return returnThis ? this : flatten( arr, this );
			}
		} else {
			Object.defineProperty( NL, prop, {
				get: function() {
					var arr = [], i = 0, l = this.length, el;
					for( ; i < l; i++ ) {
						el = this[ i ];
						if( el != null ) el = el[prop];
						arr.push( el );
					}
					return flatten( arr, this );
				},
				set: function( value ) {
					for( var i = 0, l = this.length, el; i < l; i++ ) {
						el = this[ i ];
						if( el && prop in el ) el[ prop ] = value;
					}
				}
			});
		}
	}
	div = document.createElement( 'div' );
	for( prop in div ) setterGetter( prop );
	div = prop = null;
	window.$$ = function NodeListJS() {
		return new NodeList( arguments );
	}
	window.$$.NL = NL;
})();
