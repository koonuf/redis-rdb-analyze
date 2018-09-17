import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";
import { DictionaryAllocator } from "./dictionary-allocator";

export class SetReader extends KeyReaderBase {

    private dictionaryAllocator: DictionaryAllocator;

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);

        this.dictionaryAllocator = new DictionaryAllocator();
        this.dictionaryAllocator.createDictionary(this);
        this.allocateObject();
    }

    protected readValue(): Bluebird<any> {
        return this.stream.readRdbLength().then((lengthData: IRdbLength) => {
            return this.readNextSetEntry(lengthData.len);
        });
    }

    private readNextSetEntry(remainingEntryCount: number): Bluebird<any> { 
        return this.readString({ doEncode: true }).then(() => { 

            this.dictionaryAllocator.addEntry(this);

            if (remainingEntryCount > 1) { 
                return this.readNextSetEntry(remainingEntryCount - 1);
            }
        });
    }
}