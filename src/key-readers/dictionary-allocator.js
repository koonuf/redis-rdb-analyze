"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const size_constants_1 = require("../size-constants");
const redis_constants_1 = require("../redis-constants");
class DictionaryAllocator {
    constructor() {
        this.capacity = 0;
        this.entryCount = 0;
    }
    createDictionary(allocator) {
        allocator.allocateMemory(size_constants_1.SIZE_DICT);
    }
    addEntry(reader) {
        this.expandIfNeeded(reader);
        this.entryCount++;
        reader.allocateMemory(size_constants_1.SIZE_DICT_ENTRY);
    }
    expandIfNeeded(allocator) {
        if (!this.capacity) {
            this.capacity = redis_constants_1.DICT_HT_INITIAL_SIZE;
            this.allocateMemory(allocator, this.capacity);
        }
        else if (this.entryCount >= this.capacity) {
            this.allocateMemory(allocator, this.capacity);
            this.capacity *= 2;
        }
    }
    allocateMemory(allocator, entryCount) {
        allocator.allocateMemory(entryCount * size_constants_1.SIZE_POINTER);
    }
}
exports.DictionaryAllocator = DictionaryAllocator;
//# sourceMappingURL=dictionary-allocator.js.map