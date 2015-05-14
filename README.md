# Overview

## What this is?

This is not a library, this is just a JS file that dynamically extends the `NodeList.prototype` and `HTMLCollections`
inherits from `NodeList.prototype`.

## How it's done?

The script loops through `HTMLElement.prototype` properties (inherited properties included).

When the property is a function `NodeList.prototype` gets set the same function name. When that function is called on the `NodeList` it loops through every element in the `NodeList` and calls the same function on each element. If the function call on each element returns a node then the initial function call on the `NodeList` will return a new `NodeList`. Or if the function call returns a value like the `getAttribute` method then it returns an array with each element's value of that returned value from `getAttribute`.

When the property is a readable/writable property then `NodeList.prototype` gets a `getter` and `setter` function for each property.

When readable/writable property is read on the `NodeList` the `getter` function is called on the `NodeList` which returns a new `NodeList` if that property returns a `Node` on each element, or it'll return an array populated with the values of the property from each element. (Simply the same as with the function calls, it's just not a function call).

When readable/writable property is set on the `NodeList` the `setter` function is called on the `NodeList` which loops through each element and sets the same property and value on each element.

## Inheriting from Array.prototype

`NodeList.prototype` has the Array methods: `forEach`, `entries`, `keys`, `indexOf`, `lastIndexOf`, `every`, `some`, `reduce`,
`reduceRight`, `slice`, `map`, `filter`, and `concat`. Notice all those methods work just how they would on an `Array` by not changing the actual
`NodeList`. Therefore `NodeList.prototype` does not have the methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, and `reverse`.

The `join` method would be completely useless.

I'm not sure pushing, popping, shifting, unshifting, splicing, sorting, reversing the `NodeList` would be a good thing or necessary.

## The beauty of this script

Anything you would do to a single `Node` you can do to a `NodeList` and some methods you would call on an `Array` (mentioned above)

# Examples Uses:

**ATTENTION**: Use any browser with the all DOM properties on the prototype I'm using chrome 44.

First let's consider that this line is being used in the following: `$ = document.querySelectorAll.bind(document);`.

## The HTML we'll manipulate
```HTML
<body>
	<div id="container">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>
</body>
```

## Setting a class to #container children
```JS
$('#container div').setAttribute('class', 'shape'); // Method 1 call setAttribute on NodeList

$('#container div').className = 'shape'; // Method 2 set the className of the NodeList

$('#container').children // returns an array of HTMLCollection `[HTMLCollection[10]]`

//So select the first one

$('#container').children[0].setAttribute('class', 'shape'); // Method 3 selecting children and doing same as Method 1

$('#container').children[0].className = 'shape'; // Method 4 selecting children and doing same as Method 2
```

## Removing/Emptying class attributes to #container children
```JS
$('#container div').removeAttribute('class'); // Method 1 remove the entire attribute by calling removeAttribute on NodeList

$('#container div').className = ''; // Method 2 empty the className by setting the className of NodeList
```

## Setting data-* attributes to #container children
```JS
$('#container div').setAttribute('data-shape', 'square'); // Method 1 call setAttribute on NodeList

for(var div of $('#container div')) {
	div.setAttribute('data-shape', 'square');
} // Method 2 Loop through NodeList and call setAttribute on each element

$('#container div').forEach(function(div) {
	div.dataset.shape = 'square'; // set dataset.shape
	div.setAttribute('data-shape', 'square'); // call setAttribute
}); // Method 3 call forEach on NodeList

for(var dataset of $('#container div').dataset) {
	dataset.shape = 'square';
} // Method 3 Loop through array of dataset DOMStringMap object

$('#container div').dataset.forEach(function(dataset) {
	dataset.shape = 'square';
}); // Method 5 call forEach on array of dataset DOMStringMap
```

## Setting textContent/innerText/innerHTML of #container children
```JS
$('#container div').textContent = "This is the text between each div"; // Method 1 for textContent: set textContent of nodeList

for(var div of $('#container div')) {
	div.textContent = "This is the text between each div";
} // Method 2 for textContent: loop through each element and manipulate the textContent

$('#container div').forEach(function(div, index) {
	div.textContent = "This is div number " + (index + 1);
}); // Method 3 for textContent: call forEach on NodeList and set textContent of each element

$('#container div').innerHTML = <div class="square">'; // Method 1 for innerHTML: set innerHTML of NodeList

for(var div of $('#container div')) {
	div.innerHTML = '<div class="square">';
} // Method 2 for innerHTML: loop through NodeList and set innerHTML of each element

$('#container div').forEach(function(div, index) {
	div.innerHTML = '<div class="square">';
}); // Method 3 for innerHTML: call forEach on NodeList
```

## Styling #container children
```JS
for(var div of $('#container div')) {
	div.style.color = 'red';
} // Method 1 loop through elements

$('#container div').forEach(function(div) {
	div.style.color = 'red';
}); // Method 2 call forEach on NodeList

for(var style of $('#container div').style) {
	style.color = 'red'; // Using style object
} // Method 3 loop through array of style objects

$('#container div').style.forEach(function(style) {
	style.color = 'red';
}); // Method 4 loop through style objects by calling forEach on array of style objects
```

## Adding Event listeners
```JS
$('#container div').addEventListener('click', function(evt) {
	alert(evt.target.textContent);
}); // Method 1 call addEventListener on NodeList

$('#container div').onclick = function(evt) {
	alert(evt.target.textContent);
} // Method 2 set onclick of NodeList
```

## Slicing
```JS
$('#container div').slice(0, 1); // Returns NodeList with first element;
```

## Mapping
```JS
// Mapping is easy just get the property just like you would on a node

$('#container div').id // Returns array of id for each element in NodeList

// No need for:
$('#container div').map(function(div) {
	return div.id;
});

$('#container div').map(function(div) {
	return div.firstChild;
}); // Checks if array is populated with nodes so returns a NodeList populated with firstChld nodes

$('#container div').map(function(div) {
	return div.firstChild;
}).remove(); // Map the firstChild node and remove it.

// Or:
$('#container div').firstChild.remove();

$('#container div').textContent = ''; // Or map textContent by setting textContent of NodeList to an empty string
```

## Filtering
```JS
$('div').filter(function(div) {
	return !div.matches('#container');
}); // Returns #container childElements NodeList
```

## Reducing
```JS
// Useless example:
var unique = $('div').reduce(function(set, div) {
	set.add(div.parentElement);
	return set;
}, new Set);

// Yea that's horrible, but I have no good use of reduce on NodeList
```

## Concatenating

```JS
var divs = $('div');

var divsAndBody = divs.concat(document.body); // Method 1 passing Node

var divsAndBody = divs.concat([document.body]); // Method 2 passing array of Nodes

var divsAndBody = divs.concat($('body')); // Method 3 passing a NodeList

var divsAndBody = divs.concat([$('body')]); // Method 4 passing an array of NodeList

var divsAndBodyAndHTML = divs.concat(document.body, document.documentHTML); // Method 5 passing multiple arguments

var divsAndBodyAndHTML = divs.concat([document.body], [document.documentHTML]); // Method 6 passing arrays of nodes as are arguments

var divsAndBodyAndHTML = divs.concat([$('body')], [$('html')]); // Method 7 passing arrays of NodeList as are arguments

var divsAndBody = divs.concat([[document.body]]); // Error!! No array of arrays
```

## Includes
```JS
$('body').includes(document.body); // Returns true if Node is in NodeList
```

# The future

## The current problem

```JS
$('#container div').style.background = 'red'; // Not possible
```

`$('#container div').style` returns an array of `CSSStyleDeclaration` objects so I can't set background on it

There's obviously more problems, the above is just one big feature that would be totally awesome.

## The future fix

I believe the fix would be (ES6 Proxies) or a more complicated way of doing this I'd set the returned `array.__proto__` to an object with methods that would handle this situation.

## New Methods

- Flatten:

```JS
//I'm not sure how to implement this

$('body').querySelectorAll('#container'); // Returns an array of NodeList, flatten will flatten all these nodes to a single NodeList
```

Perhaps NodeList should be able to `push`, `pop` etc

- Push

```JS
var divs = $('div');

divs.push(document.body); // Returns length of NodeList, and accepts parameters just like `concat`. Now divs contains document.body
```

- Pop

```JS
var divs = $('div');

divs.pop(); // Returns last div in NodeList and removes it from NodeList
```

- Shift
```JS
var divs = $('div');

divs.shift(); // Returns first div in NodeList and removes it from NodeList
```

- Unshift
```JS
var divs = $('div');

divs.unshift(document.body); // Returns length of NodeList, and accepts parameters just like `concat`. Now divs contains document.body
```

- Splice
```JS
var divs = $('div');

// Let's replace the first element which would be #container with document.body

divs.splice(0, 1, document.body); // Returns the same NodeList with the first element being document.body
```

- Sort

**I have no Idea why you would want to sort a `NodeList`**

```JS
var divs = $('#container div');

divs.forEach(function(div, index) {
	div.dataset.index = index;
}); // Let's give each div a data-index attribute

divs.sort(function(div1, div2) {
	return div2.dataset.index - div1.dataset.index;
}); // Which basically reverses the nodeList pretty useless example again I'm not sure why you would want to sort a NodeList
```

- Reverse
```JS
$('div').reverse(); // Simply returns a reversed NodeList (USELESS!! IMO)
```

**NO JOIN METHOD** Completely useless!!

**There's most likely other methods that I can't think of right now feedback please!**

# My wish

My wish would be to have all modern browsers implement `NodeList` like how this script does. Obviously in a much better way (because this is technically a hack IMO). Now if this is a definite NO depending on feedback from Web Devs I may refactor this code into a Library.

# Who/What is this for?

This should probably be on top but I feel the ending is better, but again my wish is to change how `NodeList` works in Web Browsers. I mean I don't see why this would hurt if it grows with help/feedback. As of right now `NodeList` don't do anything but store nodes.

So ok if this were a library IMO it'd be for Web Developers who don't use `jQuery` and like using native API's like myself or I'm pretty sure both can be benefited from (Not that jQuery is bad, it's just I've learned more from not using it I prefer to do things natively). P.S `jQuery` does a whole lot more, perhaps `jQuery` can implement something like this in their library, IDK I don't really use it. So if this were a library this would be the first library I'd use.

Getting this natively, I would need tons of help. I don't know anything about writing specs and getting things standardized. Those of you who somewhat know me, I only throw out "good" Ideas (you know "good" IMO duh).

Um that's it I think that's all I have to say.

I tweeted at [@paul_irish][1], [@addyosmani][2], [@jeresig][3], [@simevidas][4], [@BrendanEich][5] about this because those are people I admire in the Web Development Community. So Thank You Guys.

[1]: https://www.twitter.com/paul_irish/
[2]: https://www.twitter.com/addyosmani/
[3]: https://www.twitter.com/jeresig/
[4]: https://www.twitter.com/simevidas/
[5]: https://www.twitter.com/BrendanEich/

# **My Apolgies**

This is the first repository I've ever written for others to use. So bare with me, this is not professionally done. As well as I'm not that good at writing, I'm much better at speaking/talks.

I would like some feedback on editing this repository as well, like the name it's pretty bad. Perhaps **NodeList.js**?
