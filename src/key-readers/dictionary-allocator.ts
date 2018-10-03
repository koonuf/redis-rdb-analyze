import { SIZE_DICT_ENTRY, SIZE_DICT, SIZE_POINTER } from "../size-constants";
import { DICT_HT_INITIAL_SIZE } from "../redis-constants";
import { Allocator } from "./allocator";

export class DictionaryAllocator { 

    private capacity = 0;
    private entryCount = 0;

    createDictionary(allocator: Allocator) { 
        allocator.allocateMemory(SIZE_DICT);
    }

    addEntry(reader: Allocator) { 
        this.expandIfNeeded(reader);
        this.entryCount++;
        reader.allocateMemory(SIZE_DICT_ENTRY);
    }

    private expandIfNeeded(allocator: Allocator) { 
        
        if (!this.capacity) {
            this.capacity = DICT_HT_INITIAL_SIZE;
            this.allocateMemory(allocator, this.capacity);

        } else if (this.entryCount >= this.capacity) {
            this.allocateMemory(allocator, this.capacity);
            this.capacity *= 2;
        }
    }

    private allocateMemory(allocator: Allocator, entryCount: number) { 
        allocator.allocateMemory(entryCount * SIZE_POINTER);
    }
}