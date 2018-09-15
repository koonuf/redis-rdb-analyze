export const REDIS_RDB_OPCODE_EXPIRETIME_MS = 252;
export const REDIS_RDB_OPCODE_EXPIRETIME = 253;
export const REDIS_RDB_OPCODE_SELECTDB = 254;
export const REDIS_RDB_OPCODE_EOF = 255;

export const REDIS_RDB_6BITLEN = 0;
export const REDIS_RDB_14BITLEN = 1;
export const REDIS_RDB_32BITLEN = 2;
export const REDIS_RDB_ENCVAL = 3;

export const REDIS_RDB_ENC_INT8 = 0;
export const REDIS_RDB_ENC_INT16 = 1;
export const REDIS_RDB_ENC_INT32 = 2;
export const REDIS_RDB_ENC_LZF = 3;

export const REDIS_RDB_TYPE_STRING = 0;
export const REDIS_RDB_TYPE_LIST = 1;
export const REDIS_RDB_TYPE_SET = 2;
export const REDIS_RDB_TYPE_ZSET = 3;
export const REDIS_RDB_TYPE_HASH = 4;

export const REDIS_RDB_TYPE_HASH_ZIPMAP = 9;
export const REDIS_RDB_TYPE_LIST_ZIPLIST = 10;
export const REDIS_RDB_TYPE_SET_INTSET = 11;
export const REDIS_RDB_TYPE_ZSET_ZIPLIST = 12;
export const REDIS_RDB_TYPE_HASH_ZIPLIST = 13;

export const REDIS_SHARED_INTEGERS = 10000;
export const REDIS_ENCODING_EMBSTR_SIZE_LIMIT = 39;
export const DICT_HT_INITIAL_SIZE = 4;