# dynamic-json

Works with both CCLoader and CCloader3.

A mod for generating or patching a json file with javascript. 

# Usage


`DynamicJson.forExactUrl`

```js

// url should be relative to /path/to/crosscode/assets/ directory
DynamicJson.forExactUrl('data/maps/cargo-ship/room3.json', 
/**
 * 
 * @param {object} json
 * @param {object} settings captured from the ajax request
 * @param {boolean} failed true if the original ajax request failed, otherwise false.
 * @returns {object | null} null return value means json does not need to be updated.
 * */
async (json, ajaxSettings, failed) => {
    if (failed) {
        return null;
    }

    return json;
});
```

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

