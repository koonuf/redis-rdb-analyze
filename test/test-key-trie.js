"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const key_trie_1 = require("../src/key-trie");
describe("key trie", function () {
    function getPercent(val) {
        return Math.round(val * 100) + "%";
    }
    it("works with single item", () => {
        const trie = new key_trie_1.KeyTrie();
        trie.addKey({ key: "abc", keyType: "", size: 100 });
        const resultNodes = trie.getCompactTree();
        expect(resultNodes).toEqual([
            { prefix: "abc", memory: "100%" }
        ]);
    });
    it("works with shallow tree", () => {
        const trie = new key_trie_1.KeyTrie();
        trie.addKey({ key: "ab", keyType: "", size: 50 });
        trie.addKey({ key: "abc", keyType: "", size: 50 });
        trie.addKey({ key: "abcd", keyType: "", size: 100 });
        trie.addKey({ key: "abce", keyType: "", size: 200 });
        const resultNodes = trie.getCompactTree();
        expect(resultNodes).toEqual([
            {
                prefix: "ab",
                memory: "100%",
                children: [
                    {
                        prefix: "abc",
                        memory: getPercent(350 / 400),
                        children: [
                            {
                                prefix: "abce",
                                memory: getPercent(200 / 400)
                            },
                            {
                                prefix: "abcd",
                                memory: getPercent(100 / 400)
                            }
                        ]
                    }
                ]
            }
        ]);
    });
    it("works with deep tree", function () {
        const trie = new key_trie_1.KeyTrie();
        trie.addKey({ key: "abc", keyType: "", size: 100 });
        trie.addKey({ key: "ab", keyType: "", size: 100 });
        trie.addKey({ key: "a", keyType: "", size: 150 });
        trie.addKey({ key: "abd", keyType: "", size: 80 });
        trie.addKey({ key: "abde", keyType: "", size: 180 });
        const resultNodes = trie.getCompactTree();
        const total = 100 + 100 + 150 + 80 + 180;
        expect(resultNodes).toEqual([
            {
                prefix: "ab",
                memory: "100%",
                children: [
                    {
                        prefix: "abde",
                        memory: getPercent((80 + 180) / total)
                    },
                    {
                        prefix: "abc",
                        memory: getPercent(100 / total)
                    }
                ]
            }
        ]);
    });
});
//# sourceMappingURL=test-key-trie.js.map