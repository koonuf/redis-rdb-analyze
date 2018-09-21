"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const fs_1 = require("fs");
const path_1 = require("path");
function getReportsWriter(targetDir) {
    return new Bluebird((resolve, reject) => {
        const pathKeys = path_1.join(targetDir, "keys.json");
        const pathPrefixTree = path_1.join(targetDir, "prefix-tree.json");
        const fileOpenFlags = "wx";
        let keysFileDescriptor, prefixTreeFileDescriptor, isRejected = false;
        function doReject(error) {
            isRejected = true;
            reject(error);
        }
        function tryResolve() {
            if (!isRejected && keysFileDescriptor && prefixTreeFileDescriptor) {
                resolve(new ReportsWriter(keysFileDescriptor, prefixTreeFileDescriptor));
            }
        }
        fs_1.open(pathKeys, fileOpenFlags, (e, fd) => {
            if (e) {
                reject(e);
            }
            else {
                keysFileDescriptor = fd;
                tryResolve();
            }
        });
        fs_1.open(pathPrefixTree, fileOpenFlags, (e, fd) => {
            if (e) {
                reject(e);
            }
            else {
                prefixTreeFileDescriptor = fd;
                tryResolve();
            }
        });
    });
}
exports.getReportsWriter = getReportsWriter;
class ReportsWriter {
    constructor(keysFileDescriptor, prefixTreeFileDescriptor) {
        this.keysFileDescriptor = keysFileDescriptor;
        this.prefixTreeFileDescriptor = prefixTreeFileDescriptor;
    }
    write(keys, prefixTree) {
        return new Bluebird((resolve, reject) => {
            let isRejected = false;
            function onWriteEnd(error) {
                if (this.isRejected) {
                    return;
                }
                if (error) {
                    this.isRejected = true;
                    reject(error);
                }
                else {
                    resolve();
                }
            }
            fs_1.writeFile(this.keysFileDescriptor, this.serialize(keys), onWriteEnd);
            fs_1.writeFile(this.prefixTreeFileDescriptor, this.serialize(prefixTree), onWriteEnd);
        });
    }
    serialize(data) {
        return JSON.stringify(data, null, " ");
    }
}
//# sourceMappingURL=reports-writer.js.map