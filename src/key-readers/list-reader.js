"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
const size_constants_1 = require("../size-constants");
class ListReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
        this.allocateMemory(size_constants_1.SIZE_LIST);
        this.allocateObject();
    }
    readValue() {
        return this.stream.readRdbLength().then((lengthData) => {
            return this.readNextListEntry(lengthData.len);
        });
    }
    readNextListEntry(remainingEntryCount) {
        this.allocateMemory(size_constants_1.SIZE_LIST_NODE);
        return this.readString({ doEncode: true }).then(() => {
            if (remainingEntryCount > 1) {
                return this.readNextListEntry(remainingEntryCount - 1);
            }
        });
    }
}
exports.ListReader = ListReader;
//# sourceMappingURL=list-reader.js.map