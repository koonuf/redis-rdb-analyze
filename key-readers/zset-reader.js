"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
const size_constants_1 = require("../size-constants");
const dictionary_allocator_1 = require("./dictionary-allocator");
class ZSetReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
        this.dictionaryAllocator = new dictionary_allocator_1.DictionaryAllocator();
        this.dictionaryAllocator.createDictionary(this);
    }
    readValue() {
        return this.stream.readRdbLength().then((lengthData) => {
            this.allocateMemory(size_constants_1.SIZE_SKIP_LIST);
            this.allocateObject();
            return this.readNextZSetEntry(lengthData.len);
        });
    }
    readNextZSetEntry(remainingEntryCount) {
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {
            return this.stream.readDoubleValue();
        }).then(() => {
            this.allocateMemory(size_constants_1.SIZE_SKIPLIST_NODE);
            this.dictionaryAllocator.addEntry(this);
            if (remainingEntryCount > 1) {
                return this.readNextZSetEntry(remainingEntryCount - 1);
            }
        });
    }
}
exports.ZSetReader = ZSetReader;
//# sourceMappingURL=zset-reader.js.map