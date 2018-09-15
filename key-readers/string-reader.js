"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_reader_base_1 = require("./key-reader-base");
class StringReader extends key_reader_base_1.KeyReaderBase {
    constructor(stream, settings) {
        super(stream, settings);
    }
    readValue() {
        return this.readString({ doEncode: false, runAllocations: true });
    }
}
exports.StringReader = StringReader;
//# sourceMappingURL=string-reader.js.map