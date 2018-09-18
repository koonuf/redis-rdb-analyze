"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readable_stream_1 = require("./readable-stream");
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
        this.typeMap = {};
        this.dbDictionaryAllocator = new dictionary_allocator_1.DictionaryAllocator();
        this.stream = new readable_stream_1.ReadableStream(filePath);
    }
    read() {
        return this.readHeader().then(() => this.continueReadingBody());
    }
    report() {
        const keyCount = this.keys.length;
        const byteCount = this.keys.reduce((t, k) => t + k.getUsedMemoryBytes(), 0) + redis_constants_1.INITIAL_MEMORY_CONSUMPTION;
        let msg = `Keys: ${keyCount}, Bytes: ${byteCount}`;
        for (const key of Object.keys(this.typeMap)) {
            msg = msg + `\n${key}: ${this.typeMap[key]}`;
        }
        return msg;
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
            this.typeMap[rdbType] = (this.typeMap[rdbType] || 0) + 1;
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
                return this.addKey(new string_reader_1.StringReader(this.stream, this.settings));
            case redis_constants_1.REDIS_RDB_TYPE_LIST:
                return this.addKey(new list_reader_1.ListReader(this.stream, this.settings));
            case redis_constants_1.REDIS_RDB_TYPE_SET:
                return this.addKey(new set_reader_1.SetReader(this.stream, this.settings));
            case redis_constants_1.REDIS_RDB_TYPE_ZSET:
                return this.addKey(new zset_reader_1.ZSetReader(this.stream, this.settings));
            case redis_constants_1.REDIS_RDB_TYPE_HASH:
                return this.addKey(new hash_reader_1.HashReader(this.stream, this.settings));
            case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPLIST:
            case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPMAP:
            case redis_constants_1.REDIS_RDB_TYPE_LIST_ZIPLIST:
            case redis_constants_1.REDIS_RDB_TYPE_SET_INTSET:
            case redis_constants_1.REDIS_RDB_TYPE_ZSET_ZIPLIST:
            case redis_constants_1.REDIS_RDB_TYPE_HASH_ZIPLIST:
                return this.addKey(new encoded_val_reader_1.EncodedValReader(this.stream, this.settings));
            default:
                return this.stream.constructError(`Unknown rdbType ${rdbType}`);
        }
    }
    addKey(reader) {
        this.dbDictionaryAllocator.addEntry(reader);
        this.keys.push(reader);
        return reader.read();
    }
}
exports.ReaderDriver = ReaderDriver;
//# sourceMappingURL=reader-driver.js.map