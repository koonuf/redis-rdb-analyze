import { ReadableStream } from "./readable-stream";
import * as Bluebird from "bluebird";
import { ISettings, IKey } from "./schemas";
import { KeyReaderBase } from "./key-readers/key-reader-base";
import { HashReader } from "./key-readers/hash-reader";
import { ListReader } from "./key-readers/list-reader";
import { SetReader } from "./key-readers/set-reader";
import { StringReader } from "./key-readers/string-reader";
import { ZSetReader } from "./key-readers/zset-reader";
import { EncodedValReader } from "./key-readers/encoded-val-reader";
import { DictionaryAllocator } from "./key-readers/dictionary-allocator";
import {
    REDIS_RDB_OPCODE_EXPIRETIME, REDIS_RDB_OPCODE_SELECTDB,
    REDIS_RDB_OPCODE_EXPIRETIME_MS, REDIS_RDB_OPCODE_EOF,
    REDIS_RDB_TYPE_STRING, REDIS_RDB_TYPE_LIST, REDIS_RDB_TYPE_SET,
    REDIS_RDB_TYPE_ZSET, REDIS_RDB_TYPE_HASH, REDIS_RDB_TYPE_HASH_ZIPLIST,
    REDIS_RDB_TYPE_HASH_ZIPMAP, REDIS_RDB_TYPE_LIST_ZIPLIST, REDIS_RDB_TYPE_SET_INTSET,
    REDIS_RDB_TYPE_ZSET_ZIPLIST, INITIAL_MEMORY_CONSUMPTION
} from "./redis-constants";

const HEADER_SIZE = 9;
const RDB_VERSION = 6;
const HEADER_START = "REDIS";

export class ReaderDriver { 

    private keys: IKey[] = [];
    private stream: ReadableStream;

    private typeMap: any = {};
    private dbDictionaryAllocator = new DictionaryAllocator();

    constructor(
        filePath: string,
        private settings: ISettings) { 

        this.stream = new ReadableStream(filePath);
    }

    read(): Bluebird<any> { 
        return this.readHeader().then(() => this.continueReadingBody());
    }

    report(): string { 

        const keyCount = this.keys.length;
        const byteCount = this.keys.reduce((t, k) => t + k.size, 0) + INITIAL_MEMORY_CONSUMPTION;

        let msg = `Keys: ${keyCount}, Bytes: ${byteCount}`;

        for (const key of Object.keys(this.typeMap)) { 
            msg = msg + `\n${key}: ${this.typeMap[key]}`;
        }

        return msg;
    }

    getKeys(): IKey[] { 
        return this.keys;
    }

    private readHeader(): Bluebird<any> { 

        return this.stream.readNext(HEADER_SIZE).then((buffer) => {
            
            const header = buffer.toString("ascii");
            const rdbVersion = parseInt(header.substr(HEADER_START.length));

            if (!header.startsWith(HEADER_START) || !rdbVersion) {
                return this.stream.constructError("Missing RDB file header");
            }

            if (rdbVersion > RDB_VERSION) {
                return this.stream.constructError(`Expecting RDB version ${RDB_VERSION}, but loading version ${rdbVersion}`);
            }
        });
    }

    private continueReadingBody(): Bluebird<any> { 
        return this.readNextEntry().then((isEof) => { 
            if (isEof !== true) { 
                return this.continueReadingBody();
            }
        });
    }

    private readNextEntry(): Bluebird<any> { 

        return this.stream.readNextByte().then((rdbType: number) => { 

            this.typeMap[rdbType] = (this.typeMap[rdbType] || 0) + 1;

            switch (rdbType) { 
                case REDIS_RDB_OPCODE_EXPIRETIME:
                    return this.stream.readNext(4);

                case REDIS_RDB_OPCODE_EXPIRETIME_MS:
                    return this.stream.readNext(8);

                case REDIS_RDB_OPCODE_SELECTDB:
                    return this.readDbSelector();
                
                case REDIS_RDB_OPCODE_EOF:
                    return true;

                default:
                    return this.readKeyValuePair(rdbType);
            }
        });
    }

    private readDbSelector(): Bluebird<any> { 
        return this.stream.readRdbLength();
    }

    private readKeyValuePair(rdbType: number): Bluebird<any> { 

        switch (rdbType) { 

            case REDIS_RDB_TYPE_STRING:
                return this.addKey(new StringReader(this.stream, this.settings), rdbType);

            case REDIS_RDB_TYPE_LIST:
                return this.addKey(new ListReader(this.stream, this.settings), rdbType);

            case REDIS_RDB_TYPE_SET:
                return this.addKey(new SetReader(this.stream, this.settings), rdbType);

            case REDIS_RDB_TYPE_ZSET:
                return this.addKey(new ZSetReader(this.stream, this.settings), rdbType);

            case REDIS_RDB_TYPE_HASH:
                return this.addKey(new HashReader(this.stream, this.settings), rdbType);

            case REDIS_RDB_TYPE_HASH_ZIPMAP:
            case REDIS_RDB_TYPE_LIST_ZIPLIST:
            case REDIS_RDB_TYPE_SET_INTSET:
            case REDIS_RDB_TYPE_ZSET_ZIPLIST:
            case REDIS_RDB_TYPE_HASH_ZIPLIST:
                return this.addKey(new EncodedValReader(this.stream, this.settings), rdbType);

            default:
                return this.stream.constructError(`Unknown rdbType ${rdbType}`);
        }
    }

    private addKey(reader: KeyReaderBase, rdbType: number): Bluebird<any> { 
        
        this.dbDictionaryAllocator.addEntry(reader);
        
        return reader.read(getRdbTypeTitle(rdbType)).then((keyData: IKey) => { 
            this.keys.push(keyData);
        });
    }
}

function getRdbTypeTitle(rdbType: number): string { 
    
    switch (rdbType) { 

        case REDIS_RDB_TYPE_STRING:
            return "STRING";

        case REDIS_RDB_TYPE_LIST:
            return "LARGE_LIST";

        case REDIS_RDB_TYPE_SET:
            return "LARGE_SET";

        case REDIS_RDB_TYPE_ZSET:
            return "LARGE_ZSET";

        case REDIS_RDB_TYPE_HASH:
            return "LARGE_HASH";

        case REDIS_RDB_TYPE_HASH_ZIPLIST:
        case REDIS_RDB_TYPE_HASH_ZIPMAP:
            return "SMALL_HASH";
            
        case REDIS_RDB_TYPE_LIST_ZIPLIST:
            return "SMALL_LIST";
        
        case REDIS_RDB_TYPE_SET_INTSET:
            return "SMALL_SET";
        
        case REDIS_RDB_TYPE_ZSET_ZIPLIST:
            return "SMALL_ZSET";
        
        default:
            return "UNKNOWN";
    }
}