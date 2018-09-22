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
            if (!isRejected) {
                isRejected = true;
                reject("Error opening output file " + error);
            }
        }
        function tryResolve() {
            if (!isRejected && keysFileDescriptor && prefixTreeFileDescriptor) {
                const keysFile = { descriptor: keysFileDescriptor, path: pathKeys };
                const prefixTreeFile = { descriptor: prefixTreeFileDescriptor, path: pathPrefixTree };
                resolve(new ReportsWriter(keysFile, prefixTreeFile));
            }
        }
        fs_1.open(pathKeys, fileOpenFlags, (e, fd) => {
            if (e) {
                doReject(e);
            }
            else {
                keysFileDescriptor = fd;
                tryResolve();
            }
        });
        fs_1.open(pathPrefixTree, fileOpenFlags, (e, fd) => {
            if (e) {
                doReject(e);
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
    constructor(keysFile, prefixTreeFile) {
        this.keysFile = keysFile;
        this.prefixTreeFile = prefixTreeFile;
    }
    write(keys, prefixTree) {
        return new Bluebird((resolve, reject) => {
            let isRejected = false;
            function onWriteEnd(error) {
                if (isRejected) {
                    return;
                }
                if (error) {
                    isRejected = true;
                    reject(error);
                }
                else {
                    resolve();
                }
            }
            fs_1.writeFile(this.keysFile.descriptor, this.serialize(keys), onWriteEnd);
            fs_1.writeFile(this.prefixTreeFile.descriptor, this.serialize(prefixTree), onWriteEnd);
        });
    }
    cancel() {
        return new Bluebird((resolve, reject) => {
            let isRejected = false;
            function unlinkEnd(error) {
                if (isRejected) {
                    return;
                }
                if (error) {
                    isRejected = true;
                    reject(error);
                }
                else {
                    resolve();
                }
            }
            fs_1.unlink(this.keysFile.path, unlinkEnd);
            fs_1.unlink(this.prefixTreeFile.path, unlinkEnd);
        });
    }
    serialize(data) {
        return JSON.stringify(data, null, " ");
    }
}
//# sourceMappingURL=reports-writer.js.map