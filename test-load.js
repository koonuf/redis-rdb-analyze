"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reader_driver_1 = require("./src/reader-driver");
const fs_1 = require("fs");
const key_trie_1 = require("./src/data-structures/key-trie");
const settings = {
    stringEncoding: "utf8"
};
const cmd = process.argv[2];
if (cmd === "read") {
    readDump();
}
else if (cmd === "analyze") {
    analyzeDump(process.argv[3], process.argv[4]);
}
function analyzeDump(jsonPath, resultPath) {
    const keys = JSON.parse(fs_1.readFileSync(jsonPath, "utf8"));
    console.log(`Read ${keys.length} keys`);
    const keyTrie = new key_trie_1.KeyTrie();
    for (const key of keys) {
        keyTrie.addKey(key);
    }
    console.log(`Built trie`);
    const result = keyTrie.compact();
    fs_1.writeFileSync(resultPath, JSON.stringify(result, null, " "));
    // 
    // const prefixes = keyTrie.search({ topCount: 20, abovePercent: 1 });
    // console.log(JSON.stringify(prefixes, null, " "));
}
function readDump() {
    const dumpPath = process.argv[3];
    const resultPath = process.argv[4];
    const reader = new reader_driver_1.ReaderDriver(dumpPath, settings);
    reader.read()
        .then(() => {
        console.log(reader.report());
        const data = JSON.stringify(reader.getKeys(), null, "  ");
        fs_1.writeFileSync(resultPath, data);
    }).catch((e) => console.error(e));
}
//# sourceMappingURL=test-load.js.map