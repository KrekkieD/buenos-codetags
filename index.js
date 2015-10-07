'use strict';

var $reporter = require('./lib/reporter');
var $processor = require('./lib/processor');
var $findConfig = require('./lib/findConfig');

var $path = require('path');
var $fs = require('fs');

var $extend = require('extend');

module.exports = BuenosCodetags;
module.exports.reporter = $reporter;
module.exports.embeddedConfig = embeddedConfig;

var DEFAULT_CONFIG = {
    reporters: [
        [$reporter, { path: './reports/buenos-codetags.json' }]
    ],
    src: [
        './**/*.*',
        '!./node_modules/**/*',
        '!./reports/**/*',
        '!./target/**/*',
        '!./bower_components/**/*'
    ]
};

function BuenosCodetags (options) {

    if (this instanceof BuenosCodetags) {

        var self = this;

        self.options = _checkOptions(options);

        self.log = {
            totalCount: 0,
            totalErrorCount: 0,
            successCount: 0,
            failureCount: 0,
            files: {}
        };

        var processor = new $processor(self);

        self.promise = processor.checkPath()
            .then(function () {

                if (Array.isArray(self.options.reporters)) {
                    self.options.reporters.forEach(function (reporter) {

                        if (Array.isArray(reporter)) {
                            reporter[0](self.log, reporter[1], self);
                        }
                        else if (typeof reporter === 'function') {
                            reporter(self.log, null, self);
                        }
                        else {
                            throw 'Reporter should be a function or array of function (and options)';
                        }

                    });
                }

                return self.log;

            })
            .catch(function (err) {
                setTimeout(function () {
                    throw err;
                }, 0);
            });


    }
    else {
        return new BuenosCodetags(options);
    }


    function _checkOptions (options) {

        options = $extend({}, DEFAULT_CONFIG, options || {});

        if (!options.codetagsConfig) {
            // search on the fly for each file
            options.codetagsConfig = false;
        }
        else if (typeof options.codetagsConfig === 'string') {
            // must be a path to a config file.. try to read it
            try {
                options.codetagsConfig = {
                    source: $path.resolve(options.codetagsConfig),
                    config: $findConfig.parseConfig(JSON.parse($fs.readFileSync($path.resolve(options.codetagsConfig)).toString()))
                };
            } catch (e) {
                throw 'Could not read config file at ' + options.codetagsConfig;
            }
        }
        else {
            options.codetagsConfig = {
                source: 'custom',
                config: $findConfig.parseConfig(options.codetagsConfig)
            };
        }

        return options;

    }

}

function embeddedConfig () {

    return JSON.parse($fs.readFileSync($path.resolve(__dirname, 'resources/defaultConfiguration.json')).toString());

}

// execute when not imported
if (!module.parent) {
    module.exports();
}
