import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";

export class ListReader extends KeyReaderBase {

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);
        this.allocateObject();
    }

    protected readValue(): Bluebird<any> {
        return this.stream.readRdbLength().then((lengthData: IRdbLength) => {
            return this.readNextListEntry(lengthData.len);
        });
    }

    private readNextListEntry(remainingEntryCount: number): Bluebird<any> { 
        return this.readString({ doEncode: true }).then(() => { 
            if (remainingEntryCount > 1) { 
                return this.readNextListEntry(remainingEntryCount - 1);
            }
        });
    }
}