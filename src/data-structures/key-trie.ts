import { IKey, IPrefixTreeNode } from "../schemas";

export class KeyTrie { 
    
    private rootNode: TrieNode = new TrieNode();

    addKey(keyData: IKey) { 
        this.rootNode.addKey(keyData, 0);
    }

    compact(): IPrefixTreeNode[] { 

        const fullSize = this.rootNode.getSize();
        const minSize = fullSize / 100;

        this.rootNode.compact(minSize);
        
        return this.rootNode.walk([], fullSize).children!;
    }
}

class TrieNode { 
    
    private children?: ITrieChildren;
    private size = 0;

    getSize(): number { 
        return this.size;
    }

    compact(minSize: number, parentNode?: TrieNode, parentKey?: string) {

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

                delete parentNode.children![parentKey];
                parentNode.children![key] = child;
            }

            child.compact(minSize, parentNode || this, key);
            
        } else {

            for (const key of keys) {
                this.children[key].compact(minSize, this, key);
            }
        }
    }

    addKey(keyData: IKey, position: number) { 

        this.size += keyData.size;
        
        if (position >= keyData.key.length) {
            throw new Error(`past key length for ${keyData.key}`);

        } else if (position < (keyData.key.length - 1)) {
            const childNode = this.ensureChildNode(keyData, position);
            childNode.addKey(keyData, position + 1);
        }
    }

    walk(parentKeyParts: string[], fullSize: number): IPrefixTreeNode {

        const percent = Math.round(100 * this.size / fullSize) + "%";
        const fullPath = parentKeyParts.join("");

        let resultChildren: IPrefixTreeNode[] | undefined = undefined;

        if (this.children) { 

            resultChildren = [];

            parentKeyParts.push("");
            const lastIndex = parentKeyParts.length - 1;

            const keys = Object.keys(this.children).sort((a, b) => this.children![b].size - this.children![a].size);

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

    private ensureChildNode(keyData: IKey, position: number): TrieNode { 
        
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

interface ITrieChildren { 
    [keyChar: string]: TrieNode;
}

function getPrefixCandidate(keyChars: string[], size: number): IPrefixCandidate { 
    
    const weight = keyChars.length * size;

    return {
        prefix: keyChars.join(""),
        size,
        weight
    };
}

interface IPrefixCandidate { 
    prefix: string;
    size: number;
    weight: number;
}