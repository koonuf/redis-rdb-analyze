"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reader_driver_1 = require("./src/reader-driver");
const fs_1 = require("fs");
const settings = {
    stringEncoding: "utf8"
};
const dumpPath = process.argv[2];
const resultPath = process.argv[3];
const reader = new reader_driver_1.ReaderDriver(dumpPath, settings);
reader.read()
    .then(() => {
    console.log(reader.report());
    const data = JSON.stringify(reader.getKeys(), null, "  ");
    fs_1.writeFileSync(resultPath, data);
}).catch((e) => console.error(e));
//# sourceMappingURL=test-load.js.map