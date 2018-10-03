"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readable_stream_1 = require("./readable-stream");
const allocator_1 = require("./key-readers/allocator");
const hash_reader_1 = require("./key-readers/hash-reader");
const list_reader_1 = require("./key-readers/list-reader");
const set_reader_1 = require("./key-readers/set-reader");
const string_reader_1 = require("./key-readers/string-reader");
const zset_reader_1 = require("./key-readers/zset-reader");
const encoded_val_reader_1 = require("./key-readers/encoded-val-reader");
const dictionary_allocator_1 = require("./key-readers/dictionary-allocator");
const redis_constants_1 = require("./redis-constants");
const HEADER_SIZE = 9;
const RDB_VERSION = 6;
const HEADER_START = "REDIS";
class ReaderDriver {
    constructor(filePath, settings) {
        this.settings = settings;
        this.keys = [];
        this.dbDictionaryAllocator = new dictionary_allocator_1.DictionaryAllocator();
        this.dbAllocator = new allocator_1.Allocator();
        this.stream = new readable_stream_1.ReadableStream(filePath);
    }
    read() {
        return this.readHeader().then(() => this.continueReadingBody()).then(() => this.constructResults());
    }
    getPercentComplete() {
        return this.stream.getPercentComplete();
    }
    constructResults() {
        const dbOverheadBytes = this.dbAllocator.getUsedMemoryBytes();
        const byteCount = this.keys.reduce((t, k) => t + k.size, 0) + dbOverheadBytes + redis_constants_1.INITIAL_MEMORY_CONSUMPTION;
        const keyCount = this.keys.length;
        const keyTypeReportData = this.keys.reduce((t, k) => {
            let reportItem = t[k.keyType];
            if (!reportItem) {
                reportItem = t[k.keyType] = { size: 0, count: 0 };
            }
            reportItem.count++;
            reportItem.size += k.size;
            return t;
        }, {});
        const keyTypes = Object.keys(keyTypeReportData).sort((a, b) => keyTypeReportData[b].size - keyTypeReportData[a].size);
        const keyTypeReportParts = keyTypes.map((keyType) => {
            const reportItem = keyTypeReportData[keyType];
            return `${keyType}: ${Math.round(100 * reportItem.size / byteCount)}% (${reportItem.count} keys)`;
        });
        const GREEN = "\u001b[97m\u001b[42m";
        const RED = "\u001b[97m\u001b[41m";
        const COLOR_RESET = "\u001b[0m";
        const resultsReportParts = [
            ``,
            `${RED}Found ${keyCount} keys, estimated ${byteCount} bytes of memory (incl. ${dbOverheadBytes} for key `
                + `database overhead and ${redis_constants_1.INITIAL_MEMORY_CONSUMPTION} empty Redis memory usage)${COLOR_RESET}`,
            ``,
            `Memory usage by key type:`
        ].concat(keyTypeReportParts);
        const maxLineLength = resultsReportParts.reduce((t, i) => Math.max(t, i.length), 0);
        resultsReportParts.unshift(GREEN + "#".repeat(maxLineLength) + COLOR_RESET);
        resultsReportParts.unshift("");
        resultsReportParts.push("");
        resultsReportParts.push(GREEN + "#".repeat(maxLineLength) + COLOR_RESET);
        resultsReportParts.push("");
        return {
            byteCount,
            resultsReport: resultsReportParts.join("\n"),
            keys: this.keys
        };
    }
    readHeader() {
        return this.stream.readNext(HEADER_SIZE).then((buffer) => {
            const header = buffer.toString("ascii");
            const rdbVersion = parseInt(header.substr(HEADER_START.length));
            if (!header.startsWith(HEADER_START) || !rdbVersion) {
                return this.stream.constructError("Missing RDB file header");
            }
            if (rdbVersion > RDB_VERSION) {
                return this.stream.constructError(`Expecting RDB version ${RDB_VERSION}, but loading version ${rdbVersion}`);
            }
        });
    }
    continueReadingBody() {
        return this.readNextEntry().then((isEof) => {
            if (isEof !== true) {
                return this.continueReadingBody();
            }
        });
    }
    readNextEntry() {
        return this.stream.readNextByte().then((rdbType) => {
            switch (rdbType) {
                case redis_constants_1.REDIS_RDB_OPCODE_EXPIRETIME:
                    return this.stream.readNext(4);
                case redis_constants_1.REDIS_RDB_OPCODE_EXPIRETIME_MS:
                    return this.stream.readNext(8);
                case redis_constants_1.REDIS_RDB_OPCODE_SELECTDB:
                    return this.readDbSelector();
                case redis_constants_1.REDIS_RDB_OPCODE_EOF:
                    return true;
                default:
                    return this.readKeyValuePair(rdbType);
            }
        });
    }
    readDbSelector() {
        return this.stream.readRdbLength();
    }
    readKeyValuePair(rdbType) {
        switch (rdbType) {
            case redis_constants_1.REDIS_RDB_TYPE_STRING:
                return this.addKey(new string_reader_1.StringReader(this.stream, this.settings), rdbType);
            case redis_constants_1.REDIS_RDB_TYPE_LIST:
                return this.addKey(new list_reader_1.ListReader(this.stream, this.settings), rdbType);
            case redis_constants_1.REDIS_RDB_TYPE_SET:
                return this.addKey(new set_reader_1.SetReader(this.stream, this.settings), rdbType);
            case redis_constants_1.REDIS_RDB_TYPE_ZSET:
                return this.addKey(new zset_reader_1.ZSetReader(this.stream, this.settings), rdbType);
            case redis_constants_1.REDIS_RDB_TYPE_HASH:
                return this.addKey(new hash_reader_1.HashReader(this.stream, this.settings), rdbType);
            case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPMAP:
            case redis_constants_1.REDIS_RDB_TYPE_LIST_ZIPLIST:
            case redis_constants_1.REDIS_RDB_TYPE_SET_INTSET:
            case redis_constants_1.REDIS_RDB_TYPE_ZSET_ZIPLIST:
            case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPLIST:
                return this.addKey(new encoded_val_reader_1.EncodedValReader(this.stream, this.settings), rdbType);
            default:
                return this.stream.constructError(`Unknown rdbType ${rdbType}`);
        }
    }
    addKey(reader, rdbType) {
        this.dbDictionaryAllocator.addEntry(this.dbAllocator);
        return reader.read(getRdbTypeTitle(rdbType)).then((keyData) => {
            this.keys.push(keyData);
        });
    }
}
exports.ReaderDriver = ReaderDriver;
function getRdbTypeTitle(rdbType) {
    switch (rdbType) {
        case redis_constants_1.REDIS_RDB_TYPE_STRING:
            return "STRING";
        case redis_constants_1.REDIS_RDB_TYPE_LIST:
            return "LARGE_LIST";
        case redis_constants_1.REDIS_RDB_TYPE_SET:
            return "LARGE_SET";
        case redis_constants_1.REDIS_RDB_TYPE_ZSET:
            return "LARGE_ZSET";
        case redis_constants_1.REDIS_RDB_TYPE_HASH:
            return "LARGE_HASH";
        case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPLIST:
        case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPMAP:
            return "SMALL_HASH";
        case redis_constants_1.REDIS_RDB_TYPE_LIST_ZIPLIST:
            return "SMALL_LIST";
        case redis_constants_1.REDIS_RDB_TYPE_SET_INTSET:
            return "SMALL_SET";
        case redis_constants_1.REDIS_RDB_TYPE_ZSET_ZIPLIST:
            return "SMALL_ZSET";
        default:
            return "UNKNOWN";
    }
}
//# sourceMappingURL=reader-driver.js.map