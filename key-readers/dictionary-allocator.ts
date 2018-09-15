import { SIZE_DICT_ENTRY, SIZE_DICT, SIZE_POINTER } from "../size-constants";
import { DICT_HT_INITIAL_SIZE } from "../redis-constants";
import { KeyReaderBase } from "./key-reader-base";

export class DictionaryAllocator { 

    private capacity = 0;
    private entryCount = 0;

    createDictionary(reader: KeyReaderBase) { 
        reader.allocateMemory(SIZE_DICT);
    }

    addEntry(reader: KeyReaderBase) { 
        this.expandIfNeeded(reader);
        this.entryCount++;
        reader.allocateMemory(SIZE_DICT_ENTRY);
    }

    private expandIfNeeded(reader: KeyReaderBase) { 
        
        if (!this.capacity) {
            this.capacity = DICT_HT_INITIAL_SIZE;
            this.allocateMemory(reader, this.capacity);

        } else if (this.entryCount >= this.capacity) {
            this.allocateMemory(reader, this.capacity);
            this.capacity *= 2;
        }
    }

    private allocateMemory(reader: KeyReaderBase, entryCount: number) { 
        reader.allocateMemory(entryCount * SIZE_POINTER);
    }
}