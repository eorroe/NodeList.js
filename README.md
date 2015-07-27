# Overview

**First Let Me Say:** The File You'll use is `nodeListLib.js`/`nodeListLib.min.js`, **IGNORE** the others.

## What this is?

`nodeList.js` is a small (About 6kb) fully `ES5` written very powerful library which allows you to manipulate an **Array of Nodes** just like you would with a single `Node`, using the `Native DOM APIs`.

# Usage:

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
for(let i = 0, l = children.length; i++) {
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

for(let i = 0, l = styles.length; i++) {
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

for(let i = 0, l = nodes.length; i++) {
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
$$('.child').slice(0, 1); // Returns NodeList with first element;
```

## Mapping
```JS
// Mapping is easy just get the property just like you would on a node

$$('#container').id // Returns Array of id for each element in NodeList

// No need for:
$$('#container').map(element => element.id);

$$('#container div').map(div => div.firstChild); // Map() Checks if Array is fully populated with nodes so returns a NodeList populated with firstChld nodes

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
```JS
let divs = $$('div');

let divsAndBody = divs.concat(document.body); // Method 1 passing Node

let divsAndBody = divs.concat([document.body]); // Method 2 passing Array of Nodes

let divsAndBody = divs.concat($$('body')); // Method 3 passing a NodeList

let divsAndBody = divs.concat([$$('body')]); // Method 4 passing an Array of NodeList

let divsAndBodyAndHTML = divs.concat(document.body, document.documentHTML); // Method 5 passing multiple Nodes as arguments

let divsAndBodyAndHTML = divs.concat([document.body], [document.documentHTML]); // Method 6 passing Arrays of Nodes as arguments

let divsAndBodyAndHTML = divs.concat([$$('body')], [$$('html')]); // Method 7 passing Arrays of NodeList as are arguments

let divsAndBody = divs.concat([[document.body]]); // Error!! No Array of Arrays
```

## Pushing
```JS
let divs = $$('div');

divs.push(document.body); // Returns length of NodeList, and accepts parameters just like `concat`. Now divs contains document.body
```

## Poping
```JS
let divs = $$('div');

divs.pop(); // Returns last div in NodeList and removes it from NodeList
```

## Shifting
```JS
let divs = $$('div');

divs.shift(); // Returns first div in NodeList and removes it from NodeList
```

## Unshifting
```JS
let divs = $$('div');

divs.unshift(document.body); // Returns length of NodeList, and accepts parameters just like `concat`. Now divs contains document.body
```

## Splicing
```JS
let divs = $$('div');

// Let's replace the first element which would be #container with document.body

divs.splice(0, 1, document.body); // Returns the same NodeList with the first element being document.body
```

## Sorting
```JS
let divs = $$('.child');

// Let's give each div a data-index attribute
divs.forEach( (div, index) => div.dataset.index = index);

// Reverse the NodeList
divs.sort( (div1, div2) => div2.dataset.index - div1.dataset.index);
```

## Reversing
```JS
$$('div').reverse(); // Simply returns a reversed NodeList
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
$$('body').includes(document.body); // Returns true if passed Node is in NodeList
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
$$('div, a').set('href', 'https://www.example.com'); // would set `href` on both divs and anchor tags
$$('div, a').set('href', 'https://www.example.com', true); // only sets `href` on anchor tags because it checks if that property is not undefined
```

`set()` can also be used on an `Array` of properties:
```JS
$$('.child').style.set('color', 'red'); // sets each element's color to red
```

## Call
There are methods which are unique to certain elements. This is how you would call those methods:
```JS
$$('video').call('pause');
```

Or you could just loop through the elements and call the methods

What about passing arguments:
```JS
$$('.child').call('addEventListener', 'click', function(e) {});
```

*That was not a good example, couldn't think of a method that not every element has and takes parameters at the moment.*

So yes of course in this example do this instead:
```JS
$$('.child').addEventListener('click', function(e) {});
```

If the method called on any of the elements return something an `Array` of the items that were returned, will be returned from `call()` otherwise the `NodeList` will be returned to allow method chaining.

# Adding Your Own Methods:
```JS
$$.NL.myMethod = function() {
	// You'll have to write your own loop here if you want to call this on each Node or use:
	this.forEach(function(node) {
		// do something with each node
	});
}
```

# My wish
My wish would be to have all modern browsers implement `NodeList` like this. I honestly don't see why this would hurt if it grows with help/feedback. As of right now `NodeList` doesn't do anything but store `Live Nodes`. And this is using the **DOM's Native APIs** so there's nothing new, now the `set` and `get` methods won't be needed since it would be done with `ES6 Proxies`.

# Who/What is this for?
This library is for devs who want to manipulate the `DOM` using the Native DOM APIs without having to manually aloop through elements by writing your own loop, and using one function `$$` to query instead of all of the `getElementById`, `getElementsByClassName` etc.

Getting this natively, I would need tons of help. I don't know anything about writing specs and getting things standardized.

# My Gratitude:
I tweeted at [@paul_irish][1], [@addyosmani][2], [@jeresig][3], [@simevidas][4], [@BrendanEich][5] about this because those are people I admire in the Web Development Community. So Thank You Guys.

[1]: https://www.twitter.com/paul_irish/
[2]: https://www.twitter.com/addyosmani/
[3]: https://www.twitter.com/jeresig/
[4]: https://www.twitter.com/simevidas/
[5]: https://www.twitter.com/BrendanEich/
