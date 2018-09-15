"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const size_constants_1 = require("../size-constants");
const redis_constants_1 = require("../redis-constants");
const lzf = require("lzfjs");
class KeyReaderBase {
    constructor(stream, settings) {
        this.stream = stream;
        this.settings = settings;
        this.usedMemoryBytes = 0;
    }
    read() {
        return this.readKey().then(() => this.readValue());
    }
    getUsedMemoryBytes() {
        return this.usedMemoryBytes;
    }
    allocateMemory(byteCount) {
        if (byteCount & (size_constants_1.SIZE_ALLOCATION_ALIGN_BY - 1)) {
            byteCount += (size_constants_1.SIZE_ALLOCATION_ALIGN_BY - (byteCount & (size_constants_1.SIZE_ALLOCATION_ALIGN_BY - 1)));
        }
        this.usedMemoryBytes += byteCount;
    }
    readString(p) {
        return this.stream.readRdbLength().then((lengthData) => {
            if (lengthData.isEncoded) {
                switch (lengthData.len) {
                    case redis_constants_1.REDIS_RDB_ENC_INT8:
                    case redis_constants_1.REDIS_RDB_ENC_INT16:
                    case redis_constants_1.REDIS_RDB_ENC_INT32:
                        return this.readIntegerString(lengthData.len, p);
                    case redis_constants_1.REDIS_RDB_ENC_LZF:
                        return this.readLzfString(p);
                    default:
                        return this.stream.constructError(`Unknown encoded type ${lengthData.len}`);
                }
            }
            else {
                return this.stream.readNext(lengthData.len).then((buffer) => {
                    if (p.runAllocations) {
                        if (p.doEncode && lengthData.len <= redis_constants_1.REDIS_ENCODING_EMBSTR_SIZE_LIMIT) {
                            this.allocateMemory(size_constants_1.SIZE_OBJECT + size_constants_1.SIZE_STRING_HEADER + lengthData.len + 1);
                        }
                        else {
                            this.allocateString(lengthData.len);
                            this.allocateObject();
                        }
                    }
                    return {
                        value: buffer.toString(this.settings.stringEncoding),
                        byteCount: lengthData.len
                    };
                });
            }
        });
    }
    allocateString(charCount) {
        this.allocateMemory(size_constants_1.SIZE_STRING_HEADER + charCount + 1);
    }
    allocateObject() {
        this.allocateMemory(size_constants_1.SIZE_OBJECT);
    }
    readKey() {
        return this.readString({ doEncode: false, runAllocations: true }).then((readResults) => {
            this.key = readResults.value;
        });
    }
    readIntegerString(enctype, p) {
        let valuePromise;
        if (enctype === redis_constants_1.REDIS_RDB_ENC_INT8) {
            valuePromise = this.stream.readNextByte();
        }
        else if (enctype === redis_constants_1.REDIS_RDB_ENC_INT16) {
            valuePromise = this.stream.readNext(2).then(b => b.readInt16LE(0));
        }
        else if (enctype === redis_constants_1.REDIS_RDB_ENC_INT32) {
            valuePromise = this.stream.readNext(4).then(b => b.readInt32LE(0));
        }
        else {
            return this.stream.constructError(`Unknown integer type ${enctype}`);
        }
        return valuePromise.then((val) => {
            let byteCount = 0;
            if (p.doEncode) {
                if (val >= 0 && val < redis_constants_1.REDIS_SHARED_INTEGERS) {
                    // no allocation
                }
                else if (val >= size_constants_1.LONG_MIN && val <= size_constants_1.LONG_MAX) {
                    byteCount = size_constants_1.SIZE_POINTER;
                    if (p.runAllocations) {
                        this.allocateObject();
                    }
                }
                else {
                    byteCount = this.readStringFromLongLong(val, p);
                }
            }
            else {
                byteCount = this.readStringFromLongLong(val, p);
            }
            return { value: val.toString(10), byteCount };
        });
    }
    readStringFromLongLong(value, p) {
        let digitCount = 0;
        if (value < 0) {
            digitCount++; // minus sign
            value = Math.abs(value);
        }
        if (value > 0) {
            digitCount += Math.floor(Math.log10(value) + 1);
        }
        if (p.runAllocations) {
            this.allocateString(digitCount);
            this.allocateObject();
        }
        return digitCount;
    }
    readLzfString(p) {
        let compressedLength, uncompressedLength;
        return this.stream.readRdbLength()
            .then((l) => compressedLength = l.len)
            .then(() => this.stream.readRdbLength())
            .then((l) => uncompressedLength = l.len)
            .then(() => this.stream.readNext(compressedLength))
            .then((compressedBuffer) => {
            if (p.runAllocations) {
                this.allocateString(uncompressedLength);
                this.allocateObject();
            }
            const value = lzf.decompress(compressedBuffer).toString(this.settings.stringEncoding);
            return { value, byteCount: uncompressedLength };
        });
    }
}
exports.KeyReaderBase = KeyReaderBase;
//# sourceMappingURL=key-reader-base.js.map