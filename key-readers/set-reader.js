"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
const dictionary_allocator_1 = require("./dictionary-allocator");
class SetReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
        this.dictionaryAllocator = new dictionary_allocator_1.DictionaryAllocator();
        this.dictionaryAllocator.createDictionary(this);
    }
    readValue() {
        return this.stream.readRdbLength().then((lengthData) => {
            this.allocateObject();
            return this.readNextSetEntry(lengthData.len);
        });
    }
    readNextSetEntry(remainingEntryCount) {
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {
            this.dictionaryAllocator.addEntry(this);
            if (remainingEntryCount > 1) {
                return this.readNextSetEntry(remainingEntryCount - 1);
            }
        });
    }
}
exports.SetReader = SetReader;
//# sourceMappingURL=set-reader.js.map