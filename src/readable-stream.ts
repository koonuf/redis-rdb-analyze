"use strict";

import * as Bluebird from "bluebird";
import { createReadStream, ReadStream } from "fs";
import { REDIS_RDB_ENCVAL, REDIS_RDB_6BITLEN, REDIS_RDB_14BITLEN } from "./redis-constants";

const FIRST_2_BITS_MASK = 0xC0;
const LAST_6_BITS_MASK = 0x3F;

export class ReadableStream { 

    private stream: ReadStream;
    private isReadable: boolean;
    private isFinished = false;

    private deferred: Bluebird.Resolver<Buffer> | null;
    private pendingReadSize: number;

    private position: number;
    private lastReadSize: number;

    constructor(filePath: string) { 

        this.stream = createReadStream(filePath);

        this.isReadable = false;
        this.isFinished = false;
        this.resetDeferred();

        this.stream.on("readable", () => {

            this.isReadable = true;

            let buffer: Buffer | null;
            if (this.deferred && (buffer = this.readFromStream(this.pendingReadSize))) {
                this.deferred.resolve(buffer);
                this.resetDeferred();
            }
        });

        this.stream.on("end", () => {
            this.isFinished = true;
        });

        this.stream.on("error", (e) => {
            this.isFinished = true;

            if (this.deferred) { 
                this.deferred.reject(e);
                this.resetDeferred();
            }
        });
    }

    readNext(size: number): Bluebird<Buffer> { 

        if (this.isFinished) { 
            return this.constructError("Trying to read finished stream");
        }

        if (this.isReadable) {

            const buffer = this.readFromStream(size);
            if (buffer) {
                return Bluebird.resolve(buffer);

            } else {
                this.isReadable = false;
            }
        }

        if (this.deferred) {
            return this.constructError("Reading deferred stream");
        }

        this.deferred = Bluebird.defer();
        this.pendingReadSize = size;

        return this.deferred.promise;
    }

    readNextByte(): Bluebird<number> { 
        return this.readNext(1).then((buffer) => buffer[0]);
    }

    readRdbLength(): Bluebird<IRdbLength> { 

        return this.readNextByte().then((firstByte) => { 
            
            const type = (firstByte & FIRST_2_BITS_MASK) >> 6;

            const isEncoded = type === REDIS_RDB_ENCVAL;

            if (type === REDIS_RDB_ENCVAL || type === REDIS_RDB_6BITLEN) {
                
                return {
                    len: firstByte & LAST_6_BITS_MASK,
                    isEncoded
                };

            } else if (type == REDIS_RDB_14BITLEN) {
                return this.readNextByte().then((secondByte) => {
                    return {
                        len: ((firstByte & LAST_6_BITS_MASK) << 8) | secondByte,
                        isEncoded
                    };
                });
            } else {
                /* Read a 32 bit len. */
                return this.readNext(4).then((buffer: Buffer) => { 
                    return {
                        len: buffer.readInt32BE(0),
                        isEncoded
                    };
                });
            }
        });
    }

    readDoubleValue(): Bluebird<number> {

        return this.readNextByte().then((len) => { 

            switch (len) { 
                case 255:
                    return Number.NEGATIVE_INFINITY;

                case 254:
                    return Number.POSITIVE_INFINITY;

                case 253:
                    return NaN;

                default:
                    return this.readNext(len).then((buffer: Buffer) => parseFloat(buffer.toString("ascii")));    
            }
        });
    }

    constructError(errorMessage: string): Bluebird<any> { 
        return Bluebird.reject(`${errorMessage}. Current stream position: ${this.position}, last read size: ${this.lastReadSize}`);
    }

    private readFromStream(size: number): Buffer { 
        
        const buffer = this.stream.read(size);
        
        if (buffer) { 
            this.position += size;
            this.lastReadSize = size;
        }

        return buffer;
    }

    private resetDeferred() { 
        this.deferred = null;
        this.pendingReadSize = 0;
    }
}

export interface IRdbLength { 
    len: number;
    isEncoded: boolean;
}