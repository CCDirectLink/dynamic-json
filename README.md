# dynamic-json

Currently only works in ccloader3

A mod for generating a file through javascript. 
NOTE: A resource overriding and patching is ignored.

# Usage


`DynamicJson.forExactUrl`

```js
DynamicJson.forExactUrl('random/number.json', function() {
    return { number: Math.floor(Math.random() * 50) + 1};
});
```


```js
$.ajax({
    dataType: "json", 
    url: 'random/number.json',
    success: function({number}) {
        console.log('You got', number);
    }
})
```

This will print to the console `You got` with a random number starting from `1` to `50`. 

Why would you need this? No idea! But you can do it.


`DynamicJson.forRegExpUrl`

```js
DynamicJson.forRegExpUrl(/random\/number\/([0-9]+)\/([0-9]+).json/, function(start, end) {
    start = parseInt(start);
    end = parseInt(end);
    return Math.floor((Math.random() * (end + 1)) + start);
})
```

```js
$.ajax({
    dataType: "json",
    url: 'random/number/0/1.json',
    success: function(data) {
       console.log(data);
    }
})
```

This will print to the console either `0` or `1`. 

