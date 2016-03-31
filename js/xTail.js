'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const EventEmitter = require('events');

class xTail extends EventEmitter {

    constructor () {
        super();

        this.filename = '';
        this.watcher = false;
        this.currentFilesize = 0;
        this.isWatching = false;
    }

    watch (filename) {

        if (!filename) {
            this.emit('error', 'filename cannot be empty');
            return;
        }

        this.filename = filename;

        this.watcher = chokidar.watch(this.filename);

        this.watcher.on('add', (path, stats) => {
            console.log('File added');
            readFile(0, stats.size);
            this.currentFilesize = stats.size;
        });

        this.watcher.on('ready', () => {
            console.log('File ready');
        });

        this.watcher.on('change', (path, stats) => {
            console.log('File changed');
            readFile(this.currentFilesize, stats.size);
            this.currentFilesize = stats.size;
        });

        this.watcher.on('unlink', (path) => {
            // TODO
            console.log('File has been removed');
        })

        this.watcher.on('error', (error) => {
            this.emit('error', error);
        });

        // Private function
        let readFile = (start = 0, end) => {
            fs.createReadStream(filename, {
                start: this.start,
                end: this.end
            })
            .on('error', (err) => {
                this.emit('error', err.toString());
            })
            .on('data', (data) => {
                this.emit('data', {
                    lines: data.toString('utf-8').split('\n')
                });
            })
            .on('end', () => {
                console.log("Finished reading file");
            });
        };
    }

    unwatch () {
        if (this.watcher) {
            this.watcher.close();
            this.isWatching = false;
            this.currentFilesize = 0;
            this.filename = '';
        }
    }
}

module.exports = xTail;
