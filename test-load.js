"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reader_driver_1 = require("./reader-driver");
const settings = {
    stringEncoding: "utf8"
};
const filePath = process.argv[2];
const reader = new reader_driver_1.ReaderDriver(filePath, settings);
reader.read()
    .then(() => console.log(reader.report()))
    .catch((e) => console.error(e));
//# sourceMappingURL=test-load.js.map