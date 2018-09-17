import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";
import { DictionaryAllocator } from "./dictionary-allocator";

export class HashReader extends KeyReaderBase {

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
            return this.readNextHashEntry(lengthData.len);
        });
    }

    private readNextHashEntry(remainingEntryCount: number): Bluebird<any> {
        return this.readString({ doEncode: true, runAllocations: true }).then(() => {
            return this.readString({ doEncode: true, runAllocations: true });

        }).then(() => {

            this.dictionaryAllocator.addEntry(this);

            if (remainingEntryCount > 1) {
                return this.readNextHashEntry(remainingEntryCount - 1);
            }
        });
    }
}