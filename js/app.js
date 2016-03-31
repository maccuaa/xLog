'use strict';

let remote    = require('remote');
let Tail      = require('./js/xTail');
let jQuery    = require('jquery');

let bootstrap = require('bootstrap');
let dialog    = remote.require('dialog');

let tail = new Tail();
let $    = jQuery;
window.$ = jQuery;

let app = new Vue({
    el: '#app',
    data: {
        logLines: [],
        recentFiles: ['/tmp/fake.log'],
        filename: '',
        errorMessage: '',
        isWatching: false,
        autoScroll: true,
        searchQuery: '',
        filterSearchResults: false,
        searchMatchCase: false
    },
    methods: {
        openDialog: (event) => {
            dialog.showOpenDialog({
                properties: ['openFile']
            },
            (filenames) => {
                if (filenames === undefined) {
                    return;
                }

                app.watchFile(filenames[0]);
            });
        },
        watchFile: (file) => {

            if (!file) {
                return;
            }

            if (app.logLines.length) {
                app.clearLogLines();
            }

            tail.watch(file);
            document.title = 'xLog - ' + file;
            app.filename = file;

            if (app.recentFiles.indexOf(file) < 0) {
                app.recentFiles.push(file);
            }

            app.isWatching = true;
        },
        startWatch: (event) => {
            if (!app.isWatching && app.filename) {
                app.watchFile(app.filename);
            }
            else {
                app.showError('No log file is open');
            }
        },
        stopWatch: (event) => {
            tail.unwatch();
            app.isWatching = false;
        },
        clearHistory: (event) => {
            app.recentFiles = [];
        },
        clearLogLines: (event) => {
            app.logLines = [];
        },
        toggleAutoscroll: (event) => {
            app.autoScroll = !app.autoScroll;
        },
        toggleSearchMatchCase: (event) => {
            app.searchMatchCase = !app.searchMatchCase;
        },
        toggleFilterSearchResults: (event) => {
            app.filterSearchResults = !app.filterSearchResults;
        },
        showError: (message) => {
            app.errorMessage = message;
            $('#alert').show();
        }
    },
    filters: {
        highlight: (arr, searchQuery) => {
            arr.forEach((currentObject, index, array) => {

                if (searchQuery === '') {
                    currentObject.highlight = false;
                    return;
                }

                var currentMessage = currentObject.message;

                if (!app.searchMatchCase) {
                    currentMessage = currentMessage.toLowerCase();
                    searchQuery = searchQuery.toLowerCase();
                }

                if (currentMessage.indexOf(searchQuery) > -1) {
                    currentObject.highlight = true;
                }
                else {
                    currentObject.highlight = false;
                }
            });
            return arr;
        },
        xFilterBy: (arr, searchQuery, filterSearchResults) => {
            if (filterSearchResults && searchQuery !== '') {
                return arr.filter((currentObject, index, original_array) => {
                    var currentMessage = currentObject.message;

                    if (!app.searchMatchCase) {
                        currentMessage = currentMessage.toLowerCase();
                        searchQuery = searchQuery.toLowerCase();
                    }

                    return currentMessage.indexOf(searchQuery) > -1 ? true : false;
                });
            }
            return arr;
        }
    }
});

// app.filter('searchFor', (arr, search, delimiter) => {
//     console.log('hello');
// });

tail.on('error', function (error) {
    app.showError(error);
});

tail.on('data', (data) => {
    data.lines.forEach((current, index, array) => {
        if (current !== '') {
            app.logLines.push({
                message: current,
                highlight: false
            });
        }
        if (app.autoScroll) {
            // scroll to bottom
        }

    });
});
