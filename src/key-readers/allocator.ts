import { KB, MB } from "../size-constants";

const blockAlignSizes: IMemoryBlockConfig[] = [
    { breakingPoint: 4*MB, alignBy: 4*MB },
    { breakingPoint: 4*KB, alignBy: 4*KB },
    { breakingPoint: 2*KB, alignBy: 512 },
    { breakingPoint: KB, alignBy: 256 },
    { breakingPoint: 512, alignBy: 128 },
    { breakingPoint: 256, alignBy: 64 },
    { breakingPoint: 128, alignBy: 32 },
    { breakingPoint: 16, alignBy: 16 }
];

const MID_BLOCK_INDEX = 3;
const MID_BLOCK = blockAlignSizes[MID_BLOCK_INDEX];

export class Allocator { 

    private usedMemoryBytes: number = 0;

    getUsedMemoryBytes(): number { 
        return this.usedMemoryBytes;
    }

    allocateMemory(byteCount: number): number { 

        const alignBy = findMemoryBlockAlignment(byteCount);

        if (byteCount & (alignBy - 1)) { 
            byteCount += (alignBy - (byteCount & (alignBy - 1)));
        }

        this.usedMemoryBytes += byteCount;

        return byteCount;
    }
}

function findMemoryBlockAlignment(size: number): number { 

    let i = 0;

    if (size <= MID_BLOCK.breakingPoint) { 
        i = MID_BLOCK_INDEX;
    }

    for (; i < blockAlignSizes.length; i++) { 
        
        const item = blockAlignSizes[i];

        if (size >= item.breakingPoint) { 
            return item.alignBy;
        }
    }

    return 8;
}

interface IMemoryBlockConfig {
    breakingPoint: number;
    alignBy: number;
}