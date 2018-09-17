"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
const dictionary_allocator_1 = require("./dictionary-allocator");
class HashReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
        this.dictionaryAllocator = new dictionary_allocator_1.DictionaryAllocator();
        this.dictionaryAllocator.createDictionary(this);
        this.allocateObject();
    }
    readValue() {
        return this.stream.readRdbLength().then((lengthData) => {
            return this.readNextHashEntry(lengthData.len);
        });
    }
    readNextHashEntry(remainingEntryCount) {
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {
            return this.readString({ doEncode: true, runAllocations: true });
        }).then(() => {
            this.dictionaryAllocator.addEntry(this);
            if (remainingEntryCount > 1) {
                return this.readNextHashEntry(remainingEntryCount - 1);
            }
        });
    }
}
exports.HashReader = HashReader;
//# sourceMappingURL=hash-reader.js.map