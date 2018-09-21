"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reader_driver_1 = require("./reader-driver");
const reports_writer_1 = require("./reports-writer");
const key_trie_1 = require("./data-structures/key-trie");
const readline = require("readline");
const Bluebird = require("bluebird");
const settings = {
    stringEncoding: "utf8"
};
function getPrefixTree(keys) {
    const keyTrie = new key_trie_1.KeyTrie();
    for (const key of keys) {
        keyTrie.addKey(key);
    }
    return keyTrie.compact();
}
function readDump() {
    const dumpPath = process.argv[2];
    const resultPath = process.argv[3];
    const reader = new reader_driver_1.ReaderDriver(dumpPath, settings);
    let readReportProgressTimer;
    function logProgress() {
        rewriteConsoleLine(`Reading dump ${reader.getPercentComplete()}%...`);
    }
    function stopLogProgress() {
        if (readReportProgressTimer) {
            clearInterval(readReportProgressTimer);
            readReportProgressTimer = undefined;
        }
    }
    function finish(error) {
        stopLogProgress();
        if (error) {
            rewriteConsoleLine(error);
        }
        else {
            rewriteConsoleLine("done");
        }
        console.log();
        process.exit(0);
    }
    enterCliUi();
    readReportProgressTimer = setInterval(logProgress, 300);
    Bluebird.all([
        reader.read(),
        reports_writer_1.getReportsWriter(resultPath)
    ]).then((results) => {
        stopLogProgress();
        const [dumpResults, reportsWriter] = results;
        rewriteConsoleLine(dumpResults.resultsReport);
        console.log();
        rewriteConsoleLine("Building prefix tree...");
        const tree = getPrefixTree(dumpResults.keys);
        rewriteConsoleLine("Writing reports...");
        reportsWriter.write(dumpResults.keys, tree);
        finish();
    }).catch(finish);
}
function rewriteConsoleLine(message) {
    const CURSOR_LINE_START = "\u001b[0G";
    const CURSOR_LINE_CLEAR = "\u001b[0K";
    process.stdout.write(CURSOR_LINE_START + CURSOR_LINE_CLEAR + message);
}
function enterCliUi() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
        if (key && key.sequence === "\u0003") {
            console.log();
            process.exit(0);
        }
    });
}
readDump();
//# sourceMappingURL=cli.js.map