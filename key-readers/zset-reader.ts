import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";
import { SIZE_SKIPLIST_NODE, SIZE_SKIP_LIST } from "../size-constants";
import { DictionaryAllocator } from "./dictionary-allocator"; 

export class ZSetReader extends KeyReaderBase {

    private dictionaryAllocator: DictionaryAllocator;

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);

        this.dictionaryAllocator = new DictionaryAllocator();
        this.dictionaryAllocator.createDictionary(this);
    }

    protected readValue(): Bluebird<any> {
        return this.stream.readRdbLength().then((lengthData: IRdbLength) => {

            this.allocateMemory(SIZE_SKIP_LIST);
            this.allocateObject();

            return this.readNextZSetEntry(lengthData.len);
        });
    }

    private readNextZSetEntry(remainingEntryCount: number): Bluebird<any> { 
        
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {

            return this.stream.readDoubleValue();

        }).then(() => {

            this.allocateMemory(SIZE_SKIPLIST_NODE);
            this.dictionaryAllocator.addEntry(this);

            if (remainingEntryCount > 1) {
                return this.readNextZSetEntry(remainingEntryCount - 1);
            }
        });
    }
}