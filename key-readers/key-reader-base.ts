import { ReadableStream, IRdbLength } from "../readable-stream";
import * as Bluebird from "bluebird";
import { ISettings } from "../schemas";

import {
    SIZE_LONG, SIZE_OBJECT,
    SIZE_STRING_HEADER, LONG_MIN, LONG_MAX, SIZE_POINTER,
    KB, MB
} from "../size-constants";

import {
    REDIS_RDB_ENC_INT8, REDIS_RDB_ENC_INT16, REDIS_ENCODING_EMBSTR_SIZE_LIMIT,
    REDIS_RDB_ENC_INT32, REDIS_RDB_ENC_LZF, REDIS_SHARED_INTEGERS,
} from "../redis-constants";

const lzf = require("lzfjs");

export abstract class KeyReaderBase { 

    private usedMemoryBytes: number = 0;
    private key: string;

    constructor(
        protected stream: ReadableStream,
        protected settings: ISettings) { 
    }

    read(): Bluebird<any> { 
        return this.readKey().then(() => this.readValue());
    }

    getUsedMemoryBytes() { 
        return this.usedMemoryBytes;
    }

    allocateMemory(byteCount: number) { 

        const alignBy = findMemoryBlockAlignment(byteCount);

        if (byteCount & (alignBy - 1)) { 
            byteCount += (alignBy - (byteCount & (alignBy - 1)));
        }

        //console.log(byteCount);

        this.usedMemoryBytes += byteCount;
    }

    protected abstract readValue(): Bluebird<any>;

    protected readString(p: IReadStringParams): Bluebird<IReadStringResults> { 
        
        return this.stream.readRdbLength().then((lengthData: IRdbLength) => { 
            
            if (lengthData.isEncoded) {

                switch (lengthData.len) {

                    case REDIS_RDB_ENC_INT8:
                    case REDIS_RDB_ENC_INT16:
                    case REDIS_RDB_ENC_INT32:
                        return this.readIntegerString(lengthData.len, p);

                    case REDIS_RDB_ENC_LZF:
                        return this.readLzfString(p);

                    default:
                        return this.stream.constructError(`Unknown encoded type ${lengthData.len}`);
                }

            } else { 

                return this.stream.readNext(lengthData.len).then((buffer) => { 

                    if (p.skipAllAllocations !== SkipAllocationsType.All) {

                        if (p.doEncode && lengthData.len <= REDIS_ENCODING_EMBSTR_SIZE_LIMIT) {
                            this.allocateMemory(SIZE_OBJECT + SIZE_STRING_HEADER + lengthData.len + 1);
                        
                        } else {
                            this.allocateString(lengthData.len);

                            if (p.skipAllAllocations !== SkipAllocationsType.ObjectWrapper) {
                                this.allocateObject();
                            }
                        }
                    }

                    return {
                        value: buffer.toString(this.settings.stringEncoding),
                        byteCount: lengthData.len
                    };

                });
            }
        });
    }

    protected allocateString(charCount: number) { 
        this.allocateMemory(SIZE_STRING_HEADER + charCount + 1);
    }

    protected allocateObject() { 
        this.allocateMemory(SIZE_OBJECT);
    }

    private readKey(): Bluebird<any> { 
        return this.readString({ doEncode: false, skipAllAllocations: SkipAllocationsType.ObjectWrapper }).then((readResults: IReadStringResults) => {
            this.key = readResults.value;
        });
    }

    private readIntegerString(enctype: number, p: IReadStringParams): Bluebird<IReadStringResults> {
        
        let valuePromise: Bluebird<number>;

        if (enctype === REDIS_RDB_ENC_INT8) {
            valuePromise = this.stream.readNextByte();

        } else if (enctype === REDIS_RDB_ENC_INT16) {
            valuePromise = this.stream.readNext(2).then(b => b.readInt16LE(0));

        } else if (enctype === REDIS_RDB_ENC_INT32) {
            valuePromise = this.stream.readNext(4).then(b => b.readInt32LE(0));

        } else {
            return this.stream.constructError(`Unknown integer type ${enctype}`);
        }
        
        return valuePromise.then((val: number) => { 

            let byteCount = 0;

            if (p.doEncode) {

                if (val >= 0 && val < REDIS_SHARED_INTEGERS) {
                    // no allocation

                } else if (val >= LONG_MIN && val <= LONG_MAX) {

                    byteCount = SIZE_POINTER;

                    if (p.skipAllAllocations !== SkipAllocationsType.ObjectWrapper) {
                        this.allocateObject();
                    }

                } else {
                    byteCount = this.readStringFromLongLong(val, p);
                }

            } else {
                byteCount = this.readStringFromLongLong(val, p);
            }
            
            return { value: val.toString(10), byteCount };
        });
    }

    protected readStringFromLongLong(value: number, p: IReadStringParams): number { 

        let digitCount = 0;

        if (value < 0) { 
            digitCount++; // minus sign
            value = Math.abs(value);
        }

        if (value > 0) {
            digitCount += Math.floor(Math.log10(value) + 1);
        }

        if (p.skipAllAllocations !== SkipAllocationsType.All) {
            this.allocateString(digitCount);
        }

        if (p.skipAllAllocations !== SkipAllocationsType.ObjectWrapper) { 
            this.allocateObject();
        }

        return digitCount;
    }

    private readLzfString(p: IReadStringParams): Bluebird<IReadStringResults> {

        let compressedLength: number,
            uncompressedLength: number;

        return this.stream.readRdbLength()
            .then((l) => compressedLength = l.len)
            .then(() => this.stream.readRdbLength())
            .then((l) => uncompressedLength = l.len)
            .then(() => this.stream.readNext(compressedLength))
            .then((compressedBuffer) => {

                if (p.skipAllAllocations !== SkipAllocationsType.All) {
                    this.allocateString(uncompressedLength);
                }
        
                if (p.skipAllAllocations !== SkipAllocationsType.ObjectWrapper) { 
                    this.allocateObject();
                }                

                const value = lzf.decompress(compressedBuffer).toString(this.settings.stringEncoding);

                return { value, byteCount: uncompressedLength };
            });
    }
}

function findMemoryBlockAlignment(size: number): number { 
    for (const item of blockAlignSizes) { 
        if (size >= item.breakingPoint) { 
            return item.alignBy;
        }
    }

    return 8;
}

const blockAlignSizes: IMemoryBlockConfig[] = [
    { breakingPoint: 4*MB, alignBy: 4*MB },
    { breakingPoint: 4*KB, alignBy: 4*KB },
    { breakingPoint: 2*KB, alignBy: 512 },
    { breakingPoint: KB, alignBy: 256 },
    { breakingPoint: 512, alignBy: 128 },
    { breakingPoint: 256, alignBy: 64 },
    { breakingPoint: 128, alignBy: 32 },
    { breakingPoint: 16, alignBy: 16 }
];

interface IMemoryBlockConfig {
    breakingPoint: number;
    alignBy: number;
}

export interface IReadStringParams { 
    doEncode: boolean;
    skipAllAllocations?: SkipAllocationsType;
}

export enum SkipAllocationsType { 
    All = 1,
    ObjectWrapper = 2
}

export interface IReadStringResults { 
    value: string;
    byteCount: number;
}