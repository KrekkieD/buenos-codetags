'use strict';

var $fs = require('fs');
var $path = require('path');

var $sortedObject = require('sorted-object');
var $mkdirp = require('mkdirp');
var $colors = require('colors');

module.exports = reporter;

function reporter (log, options) {

    $mkdirp.sync($path.relative('.', $path.dirname(options.path)));

    // sort the files object by key for more consistent output
    var files = log.files;
    log.files = $sortedObject(files);

    $fs.writeFileSync(options.path, JSON.stringify(log, null, 4));

    console.log('');
    console.log($colors.yellow('BuenosCodetags') + ' results:\n');

    if (log.totalErrorCount === 0) {
        console.log($colors.green('    ' + [
            'Checked',
            log.totalCount,
            'files, no codetags found.'
        ].join(' ')));
    }
    else {

        console.log($colors.red('    ' + [
            'Checked',
            log.totalCount,
            'files, found a grand total of',
            log.totalErrorCount,
            'codetags in',
            log.failureCount,
            'files\n'
        ].join(' ')));

        console.log('Codetag summary:\n');

        Object.keys(log.files).forEach(function (filename) {

            var lintResult = log.files[filename];
            if (lintResult.errorCount > 0) {

                console.log('    File: ' + $colors.bold(filename) + ', ' + lintResult.errorCount + ' codetag(s)');

                lintResult.errors.sort(function (a, b) {

                    var aDec = a.line + a.character / 10;
                    var bDec = b.line + b.character / 10;
                    return aDec - bDec;

                });

                lintResult.errors.forEach(function (error) {

                    var codetag = error.codetag;

                    if (error.color && typeof $colors[error.color] === 'function') {
                        codetag = $colors[error.color](codetag);
                    }

                    console.log('        ' + [
                        '#' + error.line + ':' + error.character,
                        codetag + ':',
                        error.value
                    ].join(' '));

                });

            }
        });

        console.log('');

    }

    console.log('    Report written to ' + $path.relative('.', options.path));

}
