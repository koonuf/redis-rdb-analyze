"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const fs_1 = require("fs");
const redis_constants_1 = require("./redis-constants");
const FIRST_2_BITS_MASK = 0xC0;
const LAST_6_BITS_MASK = 0x3F;
class ReadableStream {
    constructor(filePath) {
        this.isFinished = false;
        this.stream = fs_1.createReadStream(filePath);
        this.isReadable = false;
        this.isFinished = false;
        this.resetDeferred();
        this.stream.on("readable", () => {
            this.isReadable = true;
            let buffer;
            if (this.deferred && (buffer = this.readFromStream(this.pendingReadSize))) {
                this.deferred.resolve(buffer);
                this.resetDeferred();
            }
        });
        this.stream.on("end", () => {
            this.isFinished = true;
        });
        this.stream.on("error", (e) => {
            this.isFinished = true;
            if (this.deferred) {
                this.deferred.reject(e);
                this.resetDeferred();
            }
        });
    }
    readNext(size) {
        if (this.isFinished) {
            this.throwOnReadingFinished();
        }
        if (this.isReadable) {
            const buffer = this.readFromStream(size);
            if (buffer) {
                return Bluebird.resolve(buffer);
            }
            else {
                this.isReadable = false;
            }
        }
        if (this.deferred) {
            throw new Error("Reading deferred stream");
        }
        this.deferred = Bluebird.defer();
        this.pendingReadSize = size;
        return this.deferred.promise;
    }
    readNextByte() {
        return this.readNext(1).then((buffer) => buffer[0]);
    }
    readRdbLength() {
        return this.readNextByte().then((firstByte) => {
            const type = (firstByte & FIRST_2_BITS_MASK) >> 6;
            const isEncoded = type === redis_constants_1.REDIS_RDB_ENCVAL;
            if (type === redis_constants_1.REDIS_RDB_ENCVAL || type === redis_constants_1.REDIS_RDB_6BITLEN) {
                return {
                    len: firstByte & LAST_6_BITS_MASK,
                    isEncoded
                };
            }
            else if (type == redis_constants_1.REDIS_RDB_14BITLEN) {
                return this.readNextByte().then((secondByte) => {
                    return {
                        len: ((firstByte & LAST_6_BITS_MASK) << 8) | secondByte,
                        isEncoded
                    };
                });
            }
            else {
                /* Read a 32 bit len. */
                return this.readNext(4).then((buffer) => {
                    return {
                        len: buffer.readInt32BE(0),
                        isEncoded
                    };
                });
            }
        });
    }
    readDoubleValue() {
        return this.readNextByte().then((len) => {
            switch (len) {
                case 255:
                    return Number.NEGATIVE_INFINITY;
                case 254:
                    return Number.POSITIVE_INFINITY;
                case 253:
                    return NaN;
                default:
                    return this.readNext(len).then((buffer) => parseFloat(buffer.toString("ascii")));
            }
        });
    }
    constructError(errorObject) {
        // TODO: better error description
        return Bluebird.reject(errorObject);
    }
    readFromStream(size) {
        const buffer = this.stream.read(size);
        if (buffer) {
            this.position += size;
            this.lastReadSize = size;
        }
        return buffer;
    }
    resetDeferred() {
        this.deferred = null;
        this.pendingReadSize = 0;
    }
    throwOnReadingFinished() {
        throw new Error(`Trying to read finished stream. Read bytes: ${this.position}, last read size: ${this.lastReadSize}`);
    }
}
exports.ReadableStream = ReadableStream;
//# sourceMappingURL=readable-stream.js.map