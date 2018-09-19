import { IKey, IPrefixQuery, IPrefix } from "./schemas";

export class KeyTrie { 
    
    private rootNode: TrieNode = new TrieNode();

    public addKey(keyData: IKey) { 
        this.rootNode.addKey(keyData, 0);
    }

    public search(query: IPrefixQuery): IPrefix[] { 
        return [];
    }
}

class TrieNode { 
    
    private children?: ITrieChildren;
    private leafSize?: number;
    private size = 0;

    public addKey(keyData: IKey, position: number) { 

        this.size += keyData.size;
        
        if (position >= keyData.key.length) {
            throw new Error(`past key length for ${keyData.key}`);

        } else if (position === (keyData.key.length - 1)) {
            this.leafSize = keyData.size;

        } else {
            const childNode = this.ensureChildNode(keyData, position);
            childNode.addKey(keyData, position + 1);
        }
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

interface IPrefixCandidate { 
    prefix: string;
    size: number;
    weight: number;
}

function addToSortedPrefixList(list: IPrefixCandidate[], item: IPrefixCandidate[], maxItemCount: number) { 

    if (list.length < maxItemCount) {

    } else { 

        let replacePosition = 0;
    }
}