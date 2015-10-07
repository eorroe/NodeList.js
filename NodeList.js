( function( undefined ) {
	var setProto;
	if( Object.setPrototypeOf ) {
		setProto = function setProto( nodes, owner ) {
			nodes.owner = owner;
			return Object.setPrototypeOf( nodes, NL );
		}
	} else {
		setProto = function setProto( nodes, owner ) {
			return new NodeList( [ nodes, owner ] );
		}
	}

	function flatten( arr, owner ) {
		var elms = [], i, l, el;
		for( i = 0, l = arr.length; i < l; i++ ) {
			el = arr[ i ];
			if( el instanceof Node || el === null || el === undefined ) {
				elms.push( el );
			} else if( el instanceof window.NodeList || el instanceof NodeList || el instanceof HTMLCollection || el instanceof Array ) {
				elms = Array.prototype.concat.apply( elms, flatten( el ) );
			} else {
				arr.get = NL.get; arr.set = NL.set; arr.call = NL.call; arr.owner = owner;
				return arr;
			}
		}
		return setProto( elms, owner );
	}

	function NodeList( args ) {
		var nodes, i, l;
		if( typeof args[0] === 'string' ) {
			nodes = ( args[1] || document ).querySelectorAll( args[0] );
			for( i = 0, l = this.length = nodes.length; i < l; i++ ) this[ i ] = nodes[ i ];
		} else if( args[0] instanceof Array || args[0] instanceof NodeList || args[0] instanceof window.NodeList || args[0] instanceof HTMLCollection ) {
			for( i = 0, l = this.length = args[ 0 ].length; i < l; i++ ) this[ i ] = args[0][ i ];
			if( args[1] ) this.owner = args[1];
		} else {
			for( i = 0, l = this.length = args.length; i < l; i++ ) this[ i ] = args[ i ];
		}
		return this;
	}

	var NL = NodeList.prototype = {
		includes: Array.prototype.includes || function includes( element, index ) {
			return this.indexOf( element, index ) > -1;
		},

		forEach: function forEach() {
			Array.prototype.forEach.apply( this, arguments );
			return this;
		},

		push: function push() {
			var push = Array.prototype.push.bind( this ), i, l, arg;
			for( i = 0, l = arguments.length; i < l; i++ ) {
				arg = arguments[ i ];
				if( !( arg instanceof Node ) ) throw Error( 'Passed arguments must be of Node' );
				if( this.indexOf( arg ) === -1 ) push( arg );
			}
			return this;
		},

		pop: function pop( amount ) {
			if( typeof amount !== "number" ) amount = 1;
			var nodes = [], pop = Array.prototype.pop.bind( this ), i;
			for( i = 0; i < amount; i++ ) nodes.push( pop() );
			return setProto( nodes, this );
		},

		unshift: function unshift() {
			var unshift = Array.prototype.unshift.bind( this ), i, l, arg;
			for( i = 0, l = arguments.length; i < l; i++ ) {
				arg = arguments[ i ];
				if( !( arg instanceof Node ) ) throw Error( 'Passed arguments must be of Node' );
				if( this.indexOf(arg) === -1 ) unshift( arg );
			}
			return this;
		},

		shift: function shift( amount ) {
			if( typeof amount !== "number" ) amount = 1;
			var nodes = [], shift = Array.prototype.shift.bind( this ), i;
			for( i = 0; i < amount; i++ ) nodes.push( shift() );
			return setProto(  nodes, this );
		},

		splice: function splice() {
			var i, l, nodes;
			for( i = 2, l = arguments.length; i < l; i++ ) {
				if( !( arguments[i] instanceof Node ) ) throw Error( 'Passed arguments must be of Node' );
			}
			nodes = Array.prototype.splice.apply( this, arguments );
			return setProto( nodes, this );
		},

		slice: function slice() {
			var nodes = Array.prototype.slice.apply( this, arguments );
			return setProto( nodes, this );
		},

		filter: function filter() {
			var nodes = Array.prototype.filter.apply( this, arguments );
			return setProto( nodes, this );
		},

		map: function map() {
			var mapped = Array.prototype.map.apply( this, arguments );
			return flatten( mapped, this );
		},

		concat: function concat() {
			var nodes = flatten( this ), i, l, arg;
			for( i = 0, l = arguments.length; i < l; i++ ) {
				arg = arguments[ i ];
				if( arg === null ) {
					continue;
				} else if( arg instanceof Node ) {
					if( nodes.indexOf( arg ) === -1 ) nodes.push( arg );
				} else if( arg instanceof window.NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg instanceof NodeList ) {
					nodes = nodes.concat.apply( nodes, arg );
				} else {
					throw Error( 'Concat arguments must be of a Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)' );
				}
			}
			nodes.owner = this;
			return nodes;
		},

		get: function get( prop ) {
			var arr = [], i, l, el, item;
			for( i = 0, l = this.length; i < l; i++ ) {
				el = this[ i ];
				if( el === null || el === undefined ) {
					arr.push( el );
					continue;
				}
				item = el[ prop ];
				if( item instanceof Node && arr.indexOf(item) !== -1 ) continue;
				arr.push( item );
			}
			return flatten( arr, this );
		},

		set: function set( prop, value ) {
			var i, l, el, key;
			if( prop.constructor === Object ) {
				for( i = 0, l = this.length; i < l; i++ ) {
					el = this[ i ];
					if( el !== null && el !== undefined ) {
						for( key in prop ) {
							if( el[ key ] !== undefined ) el[ key ] = prop[ key ];
						}
					}
				}
			} else {
				for( i = 0, l = this.length; i < l; i++ ) {
					el = this[ i ];
					if( el !== null && el !== undefined && el[ prop ] !== undefined ) el[ prop ] = value;
				}
			}
			return this;
		},

		call: function call() {
			var arr = [], method = Array.prototype.shift.call( arguments ), returnThis = true, i, l, el, funcCall;
			for( i = 0, l = this.length; i < l; i++ ) {
				el = this[ i ];
				if( el !== null && el !== undefined && el[ method ] instanceof Function ) {
					funcCall = el[ method ].apply( el, arguments );
					arr.push( funcCall );
					if( returnThis && funcCall !== undefined ) returnThis = false;
				} else {
					arr.push( null );
				}
			}
			return returnThis ? this : flatten( arr, this );
		},

		item: function( index ) {
			var nodes = [ this[ index ] ];
			return setProto( nodes, this );
		},

		get asArray() {
			return Array.prototype.slice.call( this );
		}
	}

	Object.getOwnPropertyNames( Array.prototype ).forEach( function( key ) {
		if( key !== 'join' && key !== 'copyWithin' && key !== 'fill' && NL[ key ] === undefined ) {
			NL[ key ] = Array.prototype[ key ];
		}
	});

	if(window.Symbol && Symbol.iterator) NL[ Symbol.iterator ] = NL.values = Array.prototype[ Symbol.iterator ];

	function setterGetter( prop ) {
		if( div[ prop ] instanceof Function ) {
			NL[ prop ] = function() {
				var arr = [], returnThis = true, i, l, el, funcCall;
				for( i = 0, l = this.length; i < l; i++ ) {
					el = this[ i ];
					if( el !== null && el !== undefined && el[ prop ] instanceof Function ) {
						funcCall = el[ prop ].apply( el, arguments );
						arr.push( funcCall );
						if( returnThis && funcCall !== undefined ) returnThis = false;
					} else {
						arr.push( null );
					}
				}
				return returnThis ? this : flatten( arr, this );
			}
		} else {
			Object.defineProperty( NL, prop, {
				get: function() {
					var arr = [], i, l, el, item;
					for( i = 0, l = this.length; i < l; i++ ) {
						el = this[ i ];
						if( el === null || el === undefined ) {
							arr.push( el );
							continue;
						}
						item = el[ prop ];
						if( item instanceof Node && arr.indexOf( item ) !== -1 ) continue;
						arr.push( item );
					}
					return flatten( arr, this );
				},
				set: function( newVal ) {
					for( var i = 0, l = this.length, el; i < l; i++ ) {
						el = this[ i ];
						if( el && el[ prop ] !== undefined ) el[ prop ] = newVal;
					}
				}
			});
		}
	}

	var div = document.createElement( 'div' );
	for( var prop in div ) setterGetter( prop );
	div = prop = null;

	window.$$ = function NodeListJS() {
		return new NodeList( arguments );
	}
	window.$$.NL = NL;
} )( undefined );
