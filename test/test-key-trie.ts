import * as expect from "expect";
import { KeyTrie } from "../src/key-trie";

describe("key trie", function () {

    function getPercent(val: number): string { 
        return (Math.round(val * 1000) / 10) + "%";
    }

    it("works with one char key", () => { 

        const trie = new KeyTrie();
        trie.addKey({ key: "a", keyType: "", size: 100 });

        const resultNodes = trie.getCompactTree();
        expect(resultNodes).toEqual([
            { prefix: "a", memory: "100%", keyCount: 1 }
        ]);
    });

    it("works with single item", () => { 

        const trie = new KeyTrie();
        trie.addKey({ key: "abc", keyType: "", size: 100 });

        const resultNodes = trie.getCompactTree();
        expect(resultNodes).toEqual([
            { prefix: "abc", memory: "100%", keyCount: 1 }
        ]);
    });

    it("works with shallow tree", () => { 

        const trie = new KeyTrie();
        trie.addKey({ key: "ab", keyType: "", size: 50 });
        trie.addKey({ key: "abc", keyType: "", size: 50 });
        trie.addKey({ key: "abcd", keyType: "", size: 100 });
        trie.addKey({ key: "abce", keyType: "", size: 200 });

        const resultNodes = trie.getCompactTree();
        expect(resultNodes).toEqual([
            {
                prefix: "ab",
                memory: "100%",
                keyCount: 4,
                children: [
                    {
                        prefix: "abc",
                        memory: getPercent(350 / 400),
                        keyCount: 3,
                        children: [
                            {
                                prefix: "abce",
                                memory: getPercent(200 / 400),
                                keyCount: 1
                            },
                            {
                                prefix: "abcd",
                                memory: getPercent(100 / 400),
                                keyCount: 1
                            }
                        ]
                    }
                ]
            }
        ]);
    });

    it("works with deep tree", function () {

        const trie = new KeyTrie();
        trie.addKey({ key: "d", keyType: "", size: 150 });
        trie.addKey({ key: "abdc", keyType: "", size: 100 });
        trie.addKey({ key: "abdaaaabbbbbbb", keyType: "", size: 46 });
        trie.addKey({ key: "abd", keyType: "", size: 80 });
        trie.addKey({ key: "abde", keyType: "", size: 180 });
        trie.addKey({ key: "abdaaaaa", keyType: "", size: 60 });
        trie.addKey({ key: "abdaaaab", keyType: "", size: 180 });

        const resultNodes = trie.getCompactTree();
        const total = 150 + 100 + 46 + 80 + 180 + 60 + 180;

        expect(resultNodes).toEqual([
            {
                prefix: "abd",
                keyCount: 6,
                memory: getPercent((total - 150) / total),
                children: [
                    {
                        prefix: "abdaaaa",
                        keyCount: 3,
                        memory: getPercent((60 + 180 + 46) / total),
                        children: [
                            {
                                prefix: "abdaaaab",
                                keyCount: 2,
                                memory: getPercent((180 + 46) / total),
                                children: [
                                    {
                                        prefix: "abdaaaabbbbbbb",
                                        keyCount: 1,
                                        memory: getPercent(46 / total)
                                    }
                                ]
                            },
                            { prefix: "abdaaaaa", keyCount: 1, memory: getPercent(60 / total) }
                        ]
                    },
                    {
                        prefix: "abde",
                        keyCount: 1,
                        memory: getPercent(180 / total)
                    },
                    {
                        prefix: "abdc",
                        keyCount: 1,
                        memory: getPercent(100 / total)
                    }
                ]
            }, {
                prefix: "d",
                keyCount: 1,
                memory: getPercent(150 / total)
            }
        ]);
    });
});