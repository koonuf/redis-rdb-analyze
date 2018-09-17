"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
class ListReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
        this.allocateObject();
    }
    readValue() {
        return this.stream.readRdbLength().then((lengthData) => {
            return this.readNextListEntry(lengthData.len);
        });
    }
    readNextListEntry(remainingEntryCount) {
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {
            if (remainingEntryCount > 1) {
                return this.readNextListEntry(remainingEntryCount - 1);
            }
        });
    }
}
exports.ListReader = ListReader;
//# sourceMappingURL=list-reader.js.map