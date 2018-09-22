import * as expect from "expect";
import { KeyTrie } from "../src/key-trie";
import { IKey, IPrefixTreeNode } from "../src/schemas";

describe("key trie", function () {

    it("works correctly", function () {

        const trie = new KeyTrie();
        trie.addKey({ key: "abc", keyType: "", size: 100 });
        trie.addKey({ key: "ab", keyType: "", size: 100 });
        trie.addKey({ key: "abd", keyType: "", size: 80 });

        const resultNodes = trie.compact();

        console.log(JSON.stringify(resultNodes, null, " "));
    });
});