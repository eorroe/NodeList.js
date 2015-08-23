# Overview

## What this is:

`NodeList.js` makes using the **Native DOM APIs** on an `Array` of `Nodes` as easy as `jQuery` with the benefits of it being extremely small at around **5k gzipped**, a **HUGE** performance boost and the browser as a dependency **(That's the most interesting part)**. It's the closest library that will ever come close to the speed of the **Native DOM APIs** because its using those APIs directly. Actually its faster in some cases (I'll let you read on and see if you can figure out why, by also looking at the source code, and a bit of playing around with it).

The first thing you'll notice is I'm using `$$`, the reason I chose this is because if you open up your devtools and do the following:

```JS
$$('div'); // will return a NodeList
```

# `NodeList.js` Usage:

## The `HTML` we'll manipulate in the following:
```HTML
<body>
	<div id="container" class="cont">
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
	</div>
</body>
```

## Let's start of by querying `#container`'s children:

Each of the following returns an `Array of Nodes` (AKA my `NodeList`, not the browser's native `NodeList`)
```JS
// Method 1
$$('#container div');

// Method 2
$$('#container').children;

// Method 3
$$('div div');
```

There's a second argument you can pass which is the scope:
```JS
let container = document.getElementById('container');
$$('div', container);
```

Which would be equivalent to:
```JS
container.querySelectorAll('div'); // just this doesn't return my NodeList, but the browsers NodeList
```

## *Getting* properties of each `Node`:

How you would normally do it:
```JS
let children = document.getElementsByClassName('child');
```

Now you would get properties on the `#container`'s children:
```JS
for(let i = 0, l = children.length; i < l; i++) {
 	children[i].id; // ''
	children[i].nodeName; // 'DIV'
	children[i].className; // 'child'
}
```

Here's how you would do it with `nodeList.js`:
```JS
$$('.child').id; // ['', '' ... x10]
$$('.child').nodeName; // ['DIV', 'DIV' ... x10]
$$('.child').className; // ['child', 'child' ... x10]
```

Therefore you would read each property just like you would with a single `Node` :)

**Notice** how it returns an `Array` of the property's value, meaning you can select them by `index` and use any `Array Methods` on them, you'll see when you get to the [looping](https://github.com/eorroe/NodeList.js#looping) part.

## *Setting* properties on each `node`:

Let's continue using the `children` variable, so this is how you would set properties on the `children`:
```JS
for(let i = 0, l = children.length; i < l; i++) {
    children[i].className = 'containerChild';
    children[i].textContent = 'This is some text';
}
```

Here's how you'd do it with `NodeList.js`:
```JS
$$('.child').className = 'containerChild';
$$('.child').textContent = 'This is some text';
```

## *Calling* methods on each `node`:

Still using the `children` variable:

Let's add an event listener to each node, even though `event delegation` would be best, but for the sake of this example:
```JS
for(let i = 0, l = children.length; i < l; i++) {
	children[i].addEventListener('click', function() {
    	console.log(this, 'was clicked');
    });
}
```
Here's how you'd do it with `NodeList.js`:
```JS
$$('.child').addEventListener('click', function() {
	console.log(this, 'was clicked');
});
```

So cool right? You can use any `Native DOM method`:

Let's set some attributes:
```JS
$$('.child').setAttribute('class', 'child div');

// For setting the class you could just do:
$$('.child').className = 'child div';
```

Clicking the elements:
```JS
$$('.child').click();
```

Removing the elements:
```JS
$$('.child').remove();
```

*I think you're getting the point any `Native Method` you could just call on the `NodeList` and it'll call it on EACH element*

**BTW:** All `DOM` Methods that would normally return `undefined` when called on a single Node will return the same `NodeList` back to allow Method Chaining. Like `setAttribute()`

## Looping
Using a for loop and `ES6` `for-of`:

We'll just remove the nodes from the `DOM` as examples:
```JS
let nodes = $$('.child');
for(let i = 0, l = nodes.length; i < l; i++) {
	nodes[i].remove();
}

for(let node of nodes) {
	node.remove();
}
```

Using `forEach`:
```JS
$$('.child').forEach(function(node) {
	node.remove();
}); // returns same Array of Nodes to allow method chaining.

// or just do:
$$('.child').remove();
```

Looping through the properties:
```JS
let styles = $$('.child').style; // returns Array of style objects (CSSStyleDeclaration)

for(let i = 0, l = styles.length; i < l; i++) {
	styles[i].color = 'red';
}

for(let style of styles) {
	style.color = 'red';
}

styles.forEach(function(style) {
	style.color = 'red';
});

// or loop thorugh the nodes themselves
let nodes = $$('.child');

for(let i = 0, l = nodes.length; i < l; i++) {
	nodes[i].style.color = 'red';
}

for(let node of nodes) {
	node.style.color = 'red';
}

nodes.forEach(function(node) {
	node.style.color = 'red';
});
```

## Slicing
```JS
$$('.child').slice(0, 1); // Returns NodeList containing first element;
```

## Mapping
```JS
// Mapping is easy just get the property just like you would on a node

$$('#container').id // Returns Array of id for each element in NodeList

// No need for:
$$('#container').map(element => element.id);

// Map() Checks if Array is fully populated with nodes so returns a NodeList populated with firstChld nodes
$$('#container div').map(div => div.firstChild);

// Map the firstChild node and remove it.
$$('#container').map(div => div.firstChild).remove();

// Or:
$$('#container').firstChild.remove();
```

## Filtering
```JS
$$('div').filter(div => !div.matches('#container')); // Returns #container childElements NodeList
```

## Reducing
```JS
// Useless example:
let unique = $$('div').reduce(function(set, div) {
	set.add(div.parentElement);
	return set;
}, new Set());

// Yea that's horrible, but I have no good example use of reduce() on NodeList
```

## Concatenating

The following `concat()` methods all return a `NodeList`
```JS
let divs = $$('div');

// Method 1 passing Node
let divsAndBody = divs.concat(document.body);

// Method 2 passing Array of Nodes
let divsAndBody = divs.concat([document.body]);

// Method 3 passing a NodeList
let divsAndBody = divs.concat($$('body'));

// Method 4 passing an Array of NodeList
let divsAndBody = divs.concat([$$('body')]);

// Method 5 passing multiple Nodes as arguments
let divsAndBodyAndHTML = divs.concat(document.body, document.documentHTML);

// Method 6 passing Arrays of Nodes as arguments
let divsAndBodyAndHTML = divs.concat([document.body], [document.documentHTML]);

// Method 7 passing Arrays of NodeList as are arguments
let divsAndBodyAndHTML = divs.concat([$$('body')], [$$('html')]);
```

`Concat()` is recursive so you can pass an `Array` that is as deep as you'd like.

Now if you pass anythinng that's not a `Node`, `NodeList`, `HTMLCollections`, `Array` or deep `Array of Arrays` that have something other than `Node`, `NodeList`, `HTMLCollections`, `Array` will **Throw** an `Error`.

## Pushing
```JS
let divs = $$('div');

divs.push(document.body); // Returns length of NodeList. Now the `divs` NodeList contains document.body
```

## Popping
```JS
let divs = $$('div');

divs.pop(); // Removes last Node in the NodeList and returns a NodeList of the removed Nodes
```

`pop()` takes an optional argument of how many `Nodes` to **POP**
```JS
divs.pop(2); // Removes last 2 Nodes in the NodeList and returns a NodeList of the removed Nodes
```

## Shifting
```JS
let divs = $$('div');

divs.shift(); // Removes first Node in the NodeList and returns a NodeList of the removed Nodes
```

`shift()` also takes an optional argument of how many `Nodes` to **SHIFT**
```JS
divs.shift(2); // Removes first 2 Nodes in the NodeList and returns a NodeList of the removed Nodes
```

## Unshifting
```JS
let divs = $$('div');

divs.unshift(document.body); // Returns length of NodeList. Now divs contains document.body
```

## Splicing

Let's replace the first element which would be #container with document.body
```JS
let divs = $$('div');

// Removes the first Element and inserts document.body in its place. Returns a NodeList of the spliced Nodes
divs.splice(0, 1, document.body);
```

## Sorting
```JS
let divs = $$('.child');

// Let's give each div a data-index attribute
divs.forEach( (div, index) => div.dataset.index = index);

// Reverse the NodeList
divs.sort( (div1, div2) => div2.dataset.index - div1.dataset.index); // Returns same NodeList
```

## Reversing
```JS
$$('div').reverse(); // Returns the same NodeList but reversed
```

## Joining
I didn't put a `join` method in the library because it'd be useless on the actual Nodes:
```JS
$$('.child').join(); // "[object HTMLDivElement], [object HTMLDivElement] ..."
```

Therefore you can still use it when mapping out properties:
```JS
$$('.child').className.join(); // "child,child,child,child,child,child,child,child,child,child"
```

## Includes
```JS
$$('body').includes(document.body); // Returns true if passed Node is included in the NodeList
```

Ok now how about dealing with elements that have unique properties. Like `HTMLAnchorElement(s)` they have the `href` property which is not inherited from `HTMLElement`. There are no `HTMLAnchorElements` in this example but here's how you'll deal with it.

# Special Methods

## Get
```JS
$$('a').href // undefined because it's a unique property that every element does not inherit

$$('a').get('href'); // returns Array of href values
```

`Get()` can also be used on an `Array` of properties:
```JS
$$('.child').style.get('color'); // returns an Array of the value of each node.style.color
```

## Set
```JS
$$('a').set('href', 'https://www.example.com/');
```

You can also call `set` for any property that **DOES NOT** exist on the actual elements:
```JS
$$('div').set('thisIsAPropertyThatDoesntExistOnEachElement', 'whateverValue');

$$('div').get('thisIsAPropertyThatDoesntExistOnEachElement'); // ['whateverValue', 'whateverValue', 'whateverValue', ...]

$$('div').set('className', 'these are the classes being set');

// Would be the same as
$$('div').className = 'these are the classes being set';
```

`set()` has a third `Boolean` parameter which determines whether to check if each `Node` has the property before setting it:
```JS
// would set `href` on both divs and anchor tags
$$('div, a').set('href', 'https://www.example.com');

// only sets `href` on anchor tags because it is a property of the anchor elements
$$('div, a').set('href', 'https://www.example.com', true);
```

`set()` can also be used on an `Array` of properties:
```JS
$$('.child').style.set('color', 'red'); // sets each element's color to red. Returns the Array of styles back
```

You can also set multiple properties:
```JS
$$('.child').set({
 textContent: 'Hello World',
 className: 'class1 class2'
});
```

Same with properties:
```JS
$$('.child').style.set({
 color: 'red',
 background: 'black'
});
```

Remember you can chain:
```JS
$$('.child').set({
 textContent: 'Hello World',
 className: 'class1 class2'
}).style.set({
 color: 'red',
 background: 'black'
});
```

## Call
There are methods which are unique to certain elements. This is how you would call those methods:
```JS
$$('video').call('pause');
```

Or you could just loop through the elements and call the methods

What about passing arguments:
```JS
$$('canvas').call('getContext', '2d'); // Returns Array of `CanvasRenderingContext2D`
```

If the method called on any of the elements returns something, an `Array` of those returned items would be returned from `call()` otherwise the `NodeList` will be returned to allow method chaining.

## The `owner` property:
All the owner propety does is give you back the `NodeList` that the property was mapped from:
```JS
var elms = $$('.child');
elms.style.owner === elms; // true
```

So I can do all kinds of stuff:
```JS
var elms = $$('.child');
var childs = elms.children.children;
childs.owner === elms.children;
childs.owner.owner === elms;
```

A bit confusing but look over it again :)

# Adding Your Own Methods:
```JS
$$.NL.myMethod = function() {
	// You'll have to write your own loop here if you want to call this on each Node or use:
	this.forEach(function(node) {
		// do something with each node
	});
}
```

# NodeListJS Compatability

| Browser | Version |
| --------|---------|
| FireFox | 3.5+    |
| Safari  | 5.0.5+  |
| Chrome  | 7+      |
| IE      | 10+     |
| Opera   | 11.6+   |

**Attention:** You have to realize that my library's dependent on the browser it's running (which is awesome so it automatically updates when the browser updates the DOM with new properties/methods) meaning if let's say the property `hidden` doesn't exist on `HTMLElement.prototype` you cant do: `$$('.child').hidden = true;`

So the [Compatability Table](https://github.com/eorroe/NodeList.js#nodelistjs-compatability) above represents what browsers suport `__proto__` and `querySelectorAll` combined which is being used in my library.

# Who/What is this for?
This library is for devs who want to manipulate the `DOM` using the **`Native DOM APIs`** in a special way using one function `$$`. Basically for [Vanilla-js](http://vanilla-js.com/) developers like myself.

# My wish
My wish would be to have all modern browsers implement `NodeList` like this. I honestly don't see why this would hurt if it grows with help/feedback. As of right now `NodeList` doesn't do anything but store `Live Nodes`. And this is using the **DOM's Native APIs** so there's nothing new, now the `set` and `get` methods won't be needed since it would be done with `ES6 Proxies`.

Getting `NodeList` natively implemented like `NodeList.js` I would need tons of help. I don't know anything about writing specs and getting things standardized.
