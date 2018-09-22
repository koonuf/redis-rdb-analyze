"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const key_trie_1 = require("../src/key-trie");
describe("key trie", function () {
    it("works correctly", function () {
        const trie = new key_trie_1.KeyTrie();
        trie.addKey({ key: "abc", keyType: "", size: 100 });
        trie.addKey({ key: "ab", keyType: "", size: 100 });
        trie.addKey({ key: "abd", keyType: "", size: 80 });
        const resultNodes = trie.compact();
        console.log(JSON.stringify(resultNodes, null, " "));
    });
});
//# sourceMappingURL=test-key-trie.js.map