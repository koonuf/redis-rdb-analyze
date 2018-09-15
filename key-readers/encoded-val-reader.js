"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
class EncodedValReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
    }
    readValue() {
        return this.readString({ doEncode: false, runAllocations: false }).then((results) => {
            this.allocateMemory(results.byteCount);
            this.allocateObject();
        });
    }
}
exports.EncodedValReader = EncodedValReader;
//# sourceMappingURL=encoded-val-reader.js.map