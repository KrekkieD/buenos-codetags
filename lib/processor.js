'use strict';

var $findConfig = require('./findConfig');

var $fs = require('fs');
var $path = require('path');

var $globby = require('globby');
var $q = require('q');

module.exports = Processor;

function Processor (buenosCodetags) {

    return {
        checkPath: checkPath
    };

    function checkPath () {

        var regex = /[^\r\n]*(\/\*|\/\*\*|\s\*|\/\/|<!--|<%--)\s(\w+):\s([^\r\n]*)/ig;

        return $globby(buenosCodetags.options.src)
            .then(function (files) {

                var deferreds = [];


                files.forEach(function (file) {

                    var codetagsConfig = buenosCodetags.options.codetagsConfig || $findConfig(file);

                    var promise = $q.nfcall($fs.readFile, file)
                        .then(function (buffer) {


                            var asString = buffer.toString();

                            var codetagData = {};
                            codetagData.errors = [];

                            var matches = regex.exec(asString);
                            while (matches) {
                                codetagData.errors.push(matches);
                                matches = regex.exec(asString);
                            }

                            if (codetagData.errors.length) {
                                codetagData.errors = parseMatches(codetagData.errors, codetagsConfig.config);
                            }

                            var fileLog = logFileProcessed(file, {
                                codetagConfig: codetagsConfig.source,
                                errorCount: codetagData.errors.length,
                                errors: codetagData.errors
                            });

                            if (!fileLog.passed) {

                                // add the filename to each error object
                                fileLog.errors.forEach(function (error) {
                                    if (error !== null) {
                                        error.filename = file;
                                    }
                                });


                            }

                            return codetagData;

                        });

                    deferreds.push(promise);

                });

                return $q.all(deferreds);

            });

    }

    function parseMatches (matches, config) {

        var result = [];

        var input;

        var searchLineNumber = 0;

        matches.forEach(function (match) {

            input = input || match.input.split(/\r\n|\r|\n/);


            var codetagLine = match.shift();
            match.shift();
            var codetag = match.shift();
            var codetagValue = stripTrailingComments(match.shift());


            var codetagLineNumber;
            var codetagColumnNumber;

            while (typeof codetagLineNumber === 'undefined' &&
                typeof codetagColumnNumber === 'undefined' &&
                input.length) {

                searchLineNumber++;

                var line = input.shift();

                if (codetagLine === line) {
                    codetagLineNumber = searchLineNumber;
                    codetagColumnNumber = line.indexOf(codetag + ':') + 1;
                }

            }

            // only add record if the tag is supported in config
            var tagConfig = config.tags[codetag.toUpperCase()];
            if (tagConfig) {

                result.push({
                    match: codetagLine,
                    color: tagConfig.color,
                    codetag: codetag.toUpperCase(),
                    mnemonic: tagConfig.mnemonic,
                    value: codetagValue,
                    line: codetagLineNumber,
                    character: codetagColumnNumber,
                    description: tagConfig.description
                });

            }

        });

        return result;

    }

    function logFileProcessed (filePath, result) {

        buenosCodetags.log.totalCount++;

        var fileDisplayName = $path.relative('.', filePath).split($path.sep).join('/');

        if (result.errorCount === 0) {
            result.passed = true;
            buenosCodetags.log.successCount++;
        }
        else {
            buenosCodetags.log.totalErrorCount += result.errorCount;
            result.passed = false;
            buenosCodetags.log.failureCount++;
        }

        buenosCodetags.log.files[fileDisplayName] = result;

        return result;

    }

    function stripTrailingComments (value) {

        return value.replace(/\s*(--%>|-->|\*+\/)\s*$/, '');

    }

}
