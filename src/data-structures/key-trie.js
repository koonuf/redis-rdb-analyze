"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyTrie {
    constructor() {
        this.rootNode = new TrieNode();
    }
    addKey(keyData) {
        this.rootNode.addKey(keyData, 0);
    }
    compact() {
        const fullSize = this.rootNode.getSize();
        const minSize = fullSize / 100;
        this.rootNode.compact(minSize);
        return this.rootNode.walk([], fullSize).children;
    }
}
exports.KeyTrie = KeyTrie;
class TrieNode {
    constructor() {
        this.size = 0;
    }
    getSize() {
        return this.size;
    }
    compact(minSize, parentNode, parentKey) {
        if (!this.children) {
            return;
        }
        let keys = Object.keys(this.children);
        for (const key of keys) {
            if (this.children[key].size < minSize) {
                delete this.children[key];
            }
        }
        keys = Object.keys(this.children);
        if (keys.length === 1) {
            let key = keys[0];
            const child = this.children[key];
            if (parentNode && parentKey) {
                key = parentKey + key;
                delete parentNode.children[parentKey];
                parentNode.children[key] = child;
            }
            child.compact(minSize, parentNode || this, key);
        }
        else {
            for (const key of keys) {
                this.children[key].compact(minSize, this, key);
            }
        }
    }
    addKey(keyData, position) {
        this.size += keyData.size;
        if (position >= keyData.key.length) {
            throw new Error(`past key length for ${keyData.key}`);
        }
        else if (position < (keyData.key.length - 1)) {
            const childNode = this.ensureChildNode(keyData, position);
            childNode.addKey(keyData, position + 1);
        }
    }
    walk(parentKeyParts, fullSize) {
        const percent = Math.round(100 * this.size / fullSize) + "%";
        const fullPath = parentKeyParts.join("");
        let resultChildren = undefined;
        if (this.children) {
            resultChildren = [];
            parentKeyParts.push("");
            const lastIndex = parentKeyParts.length - 1;
            const keys = Object.keys(this.children).sort((a, b) => this.children[b].size - this.children[a].size);
            for (const key of keys) {
                const child = this.children[key];
                parentKeyParts[lastIndex] = key;
                resultChildren.push(child.walk(parentKeyParts, fullSize));
            }
            parentKeyParts.pop();
        }
        return {
            prefix: fullPath,
            memoryConsumptionPercent: percent,
            children: resultChildren
        };
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
function getPrefixCandidate(keyChars, size) {
    const weight = keyChars.length * size;
    return {
        prefix: keyChars.join(""),
        size,
        weight
    };
}
//# sourceMappingURL=key-trie.js.map