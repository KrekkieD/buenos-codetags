'use strict';

var $fs = require('fs');
var $path = require('path');

var $upTheTree = require('up-the-tree');

module.exports = findConfig;
module.exports.parseConfig = parseConfig;

/**
 * Find config in the following order:
 * - .codetagsrc JSON file
 * - provide embedded config
 */
function findConfig (filePath) {

    var foundConfig;

    var finders = [
        _codetagsrc,
        _embedded
    ];

    var dir = $path.dirname(filePath);
    while (!foundConfig && finders.length) {
        foundConfig = finders.shift()(dir);
    }

    if (!foundConfig) {
        // screwed. should not happen.
        throw 'Oops. Could not find a config, and embedded config also appears to be missing?';
    }

    return foundConfig;

}


function _codetagsrc (dir) {

    var path = $upTheTree.resolve('.codetagsrc', {
        start: dir
    });

    if (path) {
        return {
            source: path,
            config: parseConfig(JSON.parse($fs.readFileSync(path).toString()))
        };
    }

    return false;

}

function _embedded () {

    var path = $upTheTree.resolve('resources/defaultConfiguration.json', {
        start: __dirname
    });

    return {
        source: 'embedded',
        config: parseConfig(JSON.parse($fs.readFileSync(path).toString()))
    };

}

function parseConfig (config) {

    var parsedTags = {};

    var tags = config.tags;

    Object.keys(tags).forEach(function (tag) {

        if (tags[tag].enabled) {

            parsedTags[tag] = {
                mnemonic: tag,
                color: tags[tag].color,
                coredescription: tags[tag].description
            };

            if (tags[tag].alias && tags[tag].alias.length) {

                tags[tag].alias.forEach(function (alias) {
                    if (typeof parsedTags[alias] !== 'undefined') {
                        throw 'Cannot alias tag ' + alias + ' as it is already defined for ' + parsedTags[alias].mnemonic;
                    }
                    parsedTags[alias] = parsedTags[tag];
                });

            }

        }

    });

    config.tags = parsedTags;

    return config;

}
