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
`reduceRight`, `slice`, `map`, `filter`. Notice all those methods work just how they would on Arrays by not changing the actual
`NodeList`. Therefore `NodeList.prototype` does not have the methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`.

I'm not sure if manipulating the `NodeList` like that would be a good thing.

`concat` is the only method not implemented which does not change the actual `NodeList` and returns a new one simply because I'm not sure how to implement it the same way `Arrays` would handle `concat` (I'm still thinking, suggestions would help).

## The beauty of this script

Anything you would do to a single Node you can do to the NodeList.

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

$('#container').children[0].className = 'shape'; / /Method 4 selecting children and doing same as Method 2
```

## Removing/Emptying class attributes to #container children
```JS
$('#container div').removeAttribute('class'); // Method 1 remove the entire attribute by calling removeAttribute on NodeList

$('#container div').className = ''; // Method 2 empty the className by setting the className of NodeList
```

## Setting data-* attributes to #container children
```JS
$('#container div').setAttribute('data-shape', 'square'); //Method 2 call setAttribute on NodeList

for(var dataset of $('#container div').dataset) {
	dataset.shape = 'square';
} // Method 3 Loop through each dataset DOMStringMap object and manipulate it

$('#container div').forEach(function(el) {
	// This is manipulating each element so the following both ways obviously work
	el.dataset.shape = 'square';
	el.setAttribute('data-shape', 'square');
}); // Method 4 call forEach on NodeList

$('#container div').dataset.forEach(function(dataset) {
	dataset.shape = 'square';
}); // Method 5 call forEach on array of dataset
```

## Setting textContent/innerText/innerHTML of #container children
```JS
$('#container div').textContent = "This is the text between each div"; // Method 1 set textContent of nodeList

for(var div of $('#container div')) {
	div.textContent = "This is the text between each div";
} // Method 2 for textContent loop through each element and manipulate the textContent

$('#container div').forEach(function(div, index) {
	div.textContent = "This is div number " + (index + 1);
}); // Method 3 for textContent call forEach on NodeList and set textContent of each element

$('#container div').innerHTML = "<div class="square">"; // Method 1 for innerHTML set innerHTML of NodeList

for(var div of $('#container div')) {
	div.innerHTML = "<div class="square">";
} // Method 2 for innerHTML loop through NodeList and set innerHTML of each element

$('#container div').forEach(function(div, index) {
	div.innerHTML = "<div class="square">";
}); // Method 3 for innerHTML call forEach on NodeList
```

## Styling #container children
```JS
for(var div of $('#container div')) {
	div.style.color = 'red';
} // Method 1 loop through elements

$('#container div').forEach(function(el) {
	el.style.color = 'red';
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
} // Method 2 set onclick on NodeList
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
}); // Returns a NodeList populated with firstChld nodes

$('#container div').map(function(div) {
	return div.firstChild;
}).remove(); // Map the firstChild node and remove it.

$('#container div').textContent = ''; // Or map textContent by setting textContent of NodeList to an empty string
```

## Slicing
```JS
$('#container div').slice(0, 1); // Returns NodeList with first element;
```

## Filtering
```JS
$('div').filter(function(el) {
	return !el.matches('#container');
}); // Returns #container childElements NodeList
```
