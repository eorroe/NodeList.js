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

$('#container div').setAttribute('class', 'shape'); //Method 1 (Querying the divs inside and calling setAttribute)

$('#container div').className = 'shape'; //Method 2 (Querying the divs inside and setting the className)

$('#container').children //returns an array of HTMLCollection `[HTMLCollection[10]]`

//So select the first one

$('#container').children[0].setAttribute('class', 'shape'); //Method 3 selecting children and doing same as Method 1

$('#container').children[0].className = 'shape'; //Method 4 selecting children and doing same as Method 2

```

## Removing/Emptying class attributes to #container children
```JS
$('.shape').removeAttribute('class'); //Method 1 assuming it has the class 'shape'

$('.shape').className = ""; // Method 2 empty the className assuming it has the class 'shape'

$('#container div').removeAttribute('class'); //Method 3 remove the entire attribute

$('#container div').className = ""; //Method 4 empty the className
```

## Setting data-* attributes to #container children
```JS
// Let's set a class first

$('#container div').className = 'shape'; //Method 1 set the className

$('.shape').setAttribute('data-shape', 'square'); //Method 2 use setAttribute function

for(var dataset of $('.shape').dataset) {
	dataset.shape = 'square';
} // Method 3 Loop through each dataset DOMStringMap object and manipulate it

$('.shape').forEach(function(el) {
	//This is manipulating each element so whichever way:

	el.dataset.shape = 'square';
	el.setAttribute('data-shape', 'square');
}); // Method 4 loop through each element using forEach

$('.shape').dataset.forEach(function(dataset) {
	dataset.shape = 'square';
}); // Method 5 loop through each dataset of each element using forEach because dataset returns an array of datasets
```

## Setting textContent/innerText/innerHTML of #container children
```JS

//Other ways to select the container

$('body').firstElementChild // Returns a NodeList of firstElementChildren which would be the container

$('body').querySelector('#container'); //I'll stop here there's so many ways

$('#container div').textContent = "This is the text between each div"; // Method 1 for textContent

for(var div of $('#container div')) {
	div.textContent = "This is the text between each div";
} // Method 2 for textContent

$('#container div').forEach(function(div, index) {
	div.textContent = "This is div number " + (index + 1);
}); // Method 3 for textContent

$('#container div').innerHTML = "<div class="square">"; // Method 1 for innerHTML

for(var div of $('#container div')) {
	div.innerHTML = "<div class="square">";
} // Method 2 for innerHTML

$('#container div').forEach(function(div, index) {
	div.innerHTML = "<div class="square">";
}); // Method 3 for innerHTML


```

## Styling #container children
```JS

for(var div of $('#container div')) {
	div.style.color = 'red';
} // Method 1 loop through elements

$('#container div').forEach(function(el) {
	el.style.color = 'red';
}); // Method 2 using forEach

for(var style of $('#container div').style) {
	style.color = 'red'; // Using style object
} // Method 3 loop through style objects

$('#container div').style.forEach(function(style) {
	style.color = 'red';
}); // Method 4 loop through style objects using forEach

```

## Adding Event listeners
```JS

$('#container div').addEventListener('click', function(evt) {
	alert(evt.target.textContent);
}); // Method 1

$('#container div').onclick = function(evt) {
	alert(evt.target.textContent);
} // Method 2
```

## Mapping
```JS

//Mapping is easy just use the property

$('#container div').id //Returns array of id

//No need for:
$('#container div').map(function(div) {
	return div.id;
});

//Let's add some textContent

$('#container div').textContent // This returns textContent

$('#container div').textContent = 'text inside'; // Sets textContent of each element

$('#container div').map(function(div) {
	return div.firstChild;
}); // This returns a NodeList because the array is full of only nodes when map is called on NodeList the array is checked if all are nodes, so I can chain

$('#container div').map(function(div) {
	return div.firstChild;
}).remove(); // Remove the textContent or just use

$('#container div').textContent = ""; //THERE ARE SO MANY WAYS!!!! it's so flexible
```

## Slicing
```JS

$('#container div').slice(0, 1); //Returns NodeList with first element;

$('#container div').slice(0, 1).textContent = 'Hi'; //Do whatever you want it's so awesome
```

## Filtering
```JS

$('div').filter(function(el) {
	return !el.matches('#container');
}); //Oh wow look another way to get the children divs

//This is not filtering but this is useless but look I can map out the parentElement

$('div').filter(function(el) {
	return !el.matches('#container');
}).parentElement // Returns NodeList of which all nodes are the #container
```
