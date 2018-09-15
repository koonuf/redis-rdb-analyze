import { KeyReaderBase, IReadStringResults } from "./key-reader-base";
import { ReadableStream } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";

export class EncodedValReader extends KeyReaderBase {

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);
    }

    protected readValue(): Bluebird<any> {
        return this.readString({ doEncode: false, runAllocations: false }).then((results: IReadStringResults) => { 
            this.allocateMemory(results.byteCount);
            this.allocateObject();
        });
    }
}