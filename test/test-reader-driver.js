"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reader_driver_1 = require("../src/reader-driver");
const expect = require("expect");
const path = require("path");
describe("reader driver", function () {
    it("can read and estimate memory consumption of keyspace in a dump file", (done) => {
        const dumpPath = path.join(__dirname, "./fixtures/dump.rdb");
        const settings = { stringEncoding: "utf8" };
        const reader = new reader_driver_1.ReaderDriver(dumpPath, settings);
        reader.read().then((dumpResults) => {
            expect(dumpResults.byteCount).toBeGreaterThan(1130000);
            expect(dumpResults.byteCount).toBeLessThan(1150000);
            const keys = dumpResults.keys;
            expect(keys.length).toBe(9);
            findKey(keys, "test-string", "STRING");
            findKey(keys, "test-long-list", "LARGE_LIST");
            findKey(keys, "test-short-list", "SMALL_LIST");
            findKey(keys, "test-long-set", "LARGE_SET");
            findKey(keys, "test-short-set", "SMALL_SET");
            findKey(keys, "test-long-zset", "LARGE_ZSET");
            findKey(keys, "test-short-zset", "SMALL_ZSET");
            findKey(keys, "test-long-hash", "LARGE_HASH");
            findKey(keys, "test-short-hash", "SMALL_HASH");
            done();
        }).catch(done);
    });
    function findKey(keys, keyName, keyType) {
        const key = keys.find(k => k.key === keyName);
        expect(key && key.keyType).toBe(keyType);
    }
});
//# sourceMappingURL=test-reader-driver.js.map