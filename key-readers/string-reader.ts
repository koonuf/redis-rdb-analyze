import { KeyReaderBase } from "./key-reader-base";
import { ReadableStream } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";

export class StringReader extends KeyReaderBase {

    constructor(
        stream: ReadableStream,
        settings: ISettings) { 
        
        super(stream, settings);
    }

    protected readValue(): Bluebird<any> {
        return this.readString({ doEncode: false });
    }
}