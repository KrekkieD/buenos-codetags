# Buenos Codetags!

Reads your files and lists your codetags.

## Description

A convenience tool for fetching all your `todo:`, `fixme:`, `etc:` codetags from sourcefiles. Result is shown in terminal and written to a report -- but of course that can be configured.

## Installing

```bash
$ npm install --save-dev buenos-codetags
```

## Usage

### In a node file

```
var $buenosCodetags = require('buenos-codetags');

$buenosCodetags(options);
```

### From your package.json

```
{
    "scripts": {
        "buenos-codetags": "buenos-codetags"
    }
}
```

```
$ npm run buenos-codetags
```


## Options

```
{

    /**
     * Optional. Array of reporters. Each reporter is called with the codetags results
     */
    reporters: [
    
        // a reporter can be an array where key 0 is the function 
        [ someFunction ],
        
        // a reporter can also be given a config variable
        [ someFunction, optionalConfig ],
        
        // a reporter may also be a direct function, not wrapped in an array
        someFunction,
        
        // default value:
        [ $buenosCodetags.reporter, { path: './reports/buenos-codetags.json' }]
        
    ],
    
    
    /**
     * Optional. Globs using minimatch. default value:
     */
    src: [
        './**/*.*',
        '!./**/node_modules/**/*',
        '!./**/reports/**/*',
        '!./**/target/**/*',
        '!./**/bower_components/**/*'
    ],
        
    
    /**
     * Optional. codetags rules. May be:
     * - a file path to the rules json
     * - an object containing the rules
     * When left out it will follow this order to get its config:
     * - a .codetagsrc file in file folder or up
     * - embedded config
     */
    codetagsConfig: './myConfig.json'
}
```


## API

### BuenosCodetags (class)

```javascript
var $buenosCodetags = require('buenos-codetags');

var instance = new $buenosCodetags();
```

#### .log

The log object containing the status of the checked files.

#### .options

The parsed options object.

#### .promise

A promise that is resolved when the checker is complete. The `log` is provided as argument.

```javascript
var $buenosCodetags = require('buenos-codetags');

var instance = new $buenosCodetags();
instance.promise.then(function (log) {
    // done processing!
    console.log(log);
});
```

### reporter

The default reporter. Useful in case you want to combine your own reporter with the default reporter.

```javascript
var $buenosCodetags = require('buenos-codetags');

new $buenosCodetags({
    reporters: [
        [ $buenosCodetags.reporter, { path: './reports/buenos-codetags.json' }],
        myReporter
    ]
});
```

### embeddedConfig

Returns the codetags config as embedded in the module.

```javascript
var $buenosCodetags = require('buenos-codetags');

console.log(
    $buenosCodetags.embeddedConfig()
);
```

## Reporters

You can specify your own reporters. A reporter is called as a function, the first argument being the `log`, the
second argument being the reporter config (if defined).

```
var $buenosCodetags = require('buenos-codetags');

new $buenosCodetags({
    reporters: [
    
        // function, no config can be defined
        reporterWithoutConfig,
        
        // array of function, no config defined 
        [ reporterWithoutConfig ],
        
        // array of function and config obj
        [ reporterWithConfig, { myConfig: 'defined' } ]
    ]
});

function reporterWithoutConfig (log, config) {
    
    // log = BuenosCodetags.log
    // config = undefined
    
}


function reporterWithConfig (log, config) {
    
    // log = BuenosCodetags.log
    // config = { myConfig: 'defined' };
    
}
```

### Log format

```
{
    
    // how many files are checked?
    "totalCount": 7,
    
    // how many total codetags were found?
    "totalErrorCount": 0,
        
    // how many files had no codetags?
    "successCount": 7,
    
    // how many files had codetags?
    "failureCount": 1,
    
    // object of files checked
    "files": {
    
        // file name
        "index.js": {
        
            // where did the codetags config come from?
            "codetagsConfig": "embedded", // embedded, custom, or file path
            
            // how many codetags were found in this file?
            "errorCount": 0,
            
            // array of codetags found in this file
            "errors": [
                {
                    // original regex match
                    "match": "/* todo: css comment */",
                    // color to use for the terminal output
                    "color": "green",
                    // tag
                    "codetag": "TODO",
                    // if codetag is an alias the mnemonic shows the aliased codetag
                    "mnemonic": "TODO",
                    // value of the codetag
                    "value": "css comment",
                    "line": 1,
                    "character": 4,
                    "filename": "./test/resources/css.css"
                },
            ],
            
            // did the file pass the check?
            "passed": true
        }
    }
}
```

