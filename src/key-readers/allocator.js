"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const size_constants_1 = require("../size-constants");
const blockAlignSizes = [
    { breakingPoint: 4 * size_constants_1.MB, alignBy: 4 * size_constants_1.MB },
    { breakingPoint: 4 * size_constants_1.KB, alignBy: 4 * size_constants_1.KB },
    { breakingPoint: 2 * size_constants_1.KB, alignBy: 512 },
    { breakingPoint: size_constants_1.KB, alignBy: 256 },
    { breakingPoint: 512, alignBy: 128 },
    { breakingPoint: 256, alignBy: 64 },
    { breakingPoint: 128, alignBy: 32 },
    { breakingPoint: 16, alignBy: 16 }
];
const MID_BLOCK_INDEX = 3;
const MID_BLOCK = blockAlignSizes[MID_BLOCK_INDEX];
class Allocator {
    constructor() {
        this.usedMemoryBytes = 0;
    }
    getUsedMemoryBytes() {
        return this.usedMemoryBytes;
    }
    allocateMemory(byteCount) {
        const alignBy = findMemoryBlockAlignment(byteCount);
        if (byteCount & (alignBy - 1)) {
            byteCount += (alignBy - (byteCount & (alignBy - 1)));
        }
        this.usedMemoryBytes += byteCount;
        return byteCount;
    }
}
exports.Allocator = Allocator;
function findMemoryBlockAlignment(size) {
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
//# sourceMappingURL=allocator.js.map