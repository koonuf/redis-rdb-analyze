import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";

export class ListReader extends KeyReaderBase {

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);
    }

    protected readValue(): Bluebird<any> {
        return this.stream.readRdbLength().then((lengthData: IRdbLength) => {

            this.allocateObject();

            return this.readNextListEntry(lengthData.len);
        });
    }

    private readNextListEntry(remainingEntryCount: number): Bluebird<any> { 
        return this.readString({ doEncode: true, runAllocations: true }).then(() => { 
            if (remainingEntryCount > 1) { 
                return this.readNextListEntry(remainingEntryCount - 1);
            }
        });
    }
}