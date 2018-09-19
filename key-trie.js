"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyTrie {
    constructor() {
        this.rootNode = new TrieNode();
    }
    addKey(keyData) {
        this.rootNode.addKey(keyData, 0);
    }
    search(query) {
        return [];
    }
}
exports.KeyTrie = KeyTrie;
class TrieNode {
    constructor() {
        this.size = 0;
    }
    addKey(keyData, position) {
        this.size += keyData.size;
        if (position >= keyData.key.length) {
            throw new Error(`past key length for ${keyData.key}`);
        }
        else if (position === (keyData.key.length - 1)) {
            this.leafSize = keyData.size;
        }
        else {
            const childNode = this.ensureChildNode(keyData, position);
            childNode.addKey(keyData, position + 1);
        }
    }
    ensureChildNode(keyData, position) {
        if (!this.children) {
            this.children = {};
        }
        const keyChar = keyData.key[position];
        let childTrieNode = this.children[keyChar];
        if (!childTrieNode) {
            childTrieNode = new TrieNode();
            this.children[keyChar] = childTrieNode;
        }
        return childTrieNode;
    }
}
function addToSortedPrefixList(list, item, maxItemCount) {
    if (list.length < maxItemCount) {
    }
    else {
        let replacePosition = 0;
    }
}
//# sourceMappingURL=key-trie.js.map