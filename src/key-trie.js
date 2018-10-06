"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyTrie {
    constructor() {
        this.rootNode = new TrieNode();
    }
    addKey(keyData) {
        this.rootNode.addKey(keyData, 0);
    }
    getCompactTree() {
        const fullSize = this.rootNode.getSize();
        const minSize = fullSize / 1000;
        this.rootNode.compact(minSize);
        return this.rootNode.getCompactNode([], fullSize).children;
    }
}
exports.KeyTrie = KeyTrie;
class TrieNode {
    constructor() {
        this.size = 0;
        this.keyCount = 0;
    }
    getSize() {
        return this.size;
    }
    getKeyCount() {
        return this.keyCount;
    }
    compact(minSize, parentNode, parentKey, parentKeyCount) {
        if (!this.children) {
            return;
        }
        let childKeys = Object.keys(this.children);
        let childKeyCount = childKeys.length;
        for (const key of childKeys) {
            if (this.children[key].size < minSize) {
                delete this.children[key];
                childKeyCount--;
            }
        }
        if (!childKeyCount) {
            delete this.children;
            return;
        }
        childKeys = Object.keys(this.children);
        if (childKeys.length === 1 && !this.isLeaf) {
            let key = childKeys[0];
            const child = this.children[key];
            if (parentNode && parentKey) {
                key = parentKey + key;
                delete parentNode.children[parentKey];
                child.size = this.size;
                child.keyCount = this.keyCount;
                parentNode.children[key] = child;
            }
            child.compact(minSize, parentNode || this, key);
        }
        else {
            for (const key of childKeys) {
                this.children[key].compact(minSize, this, key);
            }
        }
    }
    addKey(keyData, position) {
        const remainingChars = keyData.key.length - 1 - position;
        if (remainingChars < 0) {
            throw new Error(`past key length for ${keyData.key}`);
        }
        this.size += keyData.size;
        this.keyCount++;
        if (remainingChars >= 0) {
            const childNode = this.ensureChildNode(keyData, position);
            if (remainingChars >= 1) {
                childNode.addKey(keyData, position + 1);
            }
            else {
                childNode.size += keyData.size;
                childNode.keyCount++;
                childNode.isLeaf = true;
            }
        }
    }
    getCompactNode(parentKeyParts, fullSize) {
        const percent = (Math.round(1000 * this.size / fullSize) / 10) + "%";
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
                resultChildren.push(child.getCompactNode(parentKeyParts, fullSize));
            }
            parentKeyParts.pop();
        }
        const result = {
            prefix: fullPath,
            memory: percent,
            keyCount: this.keyCount
        };
        if (resultChildren) {
            result.children = resultChildren;
        }
        return result;
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
//# sourceMappingURL=key-trie.js.map