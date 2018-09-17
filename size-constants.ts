const BITS_IN_BYTE = 8;
export const KB = 1024;
export const MB = KB * KB;

const NORMALIZE_SIZE_BY = 64 / BITS_IN_BYTE;

export const SIZE_POINTER = 64 / BITS_IN_BYTE;
export const LONG_MIN = -9223372036854775808;
export const LONG_MAX = 9223372036854775807;

export const SIZE_INT = 32 / BITS_IN_BYTE;
export const SIZE_LONG = 64 / BITS_IN_BYTE;
export const SIZE_DOUBLE = 64 / BITS_IN_BYTE;

const SIZE_LRU = 24 / BITS_IN_BYTE;

export const SIZE_OBJECT = normalizeSize(((4 + 4) / BITS_IN_BYTE) + SIZE_LRU + SIZE_INT + SIZE_POINTER);
export const SIZE_STRING_HEADER = normalizeSize(SIZE_INT + SIZE_INT);

export const SIZE_SKIPLIST_LEVEL = normalizeSize(SIZE_INT + SIZE_POINTER);
export const SIZE_SKIP_LIST = normalizeSize(SIZE_POINTER + SIZE_POINTER + SIZE_LONG + SIZE_INT);
export const SIZE_ZSET = normalizeSize(SIZE_POINTER + SIZE_POINTER);

const SIZE_DICT_HASH_TABLE = SIZE_POINTER + (SIZE_LONG * 3);
export const SIZE_DICT = normalizeSize(SIZE_POINTER + SIZE_POINTER + (SIZE_DICT_HASH_TABLE * 2) + SIZE_LONG + SIZE_INT);

const MAX_SKIP_LIST_LEVELS = 32;
export const SIZE_SKIPLIST_HEAD_NODE = getSkipListNodeSize(MAX_SKIP_LIST_LEVELS);

export const SIZE_DICT_ENTRY = normalizeSize(SIZE_POINTER + SIZE_POINTER + SIZE_DOUBLE);

function normalizeSize(size: number): number { 
    if (size & (NORMALIZE_SIZE_BY - 1)) { 
        size += (NORMALIZE_SIZE_BY - (size & (NORMALIZE_SIZE_BY - 1)));
    }

    return size;
}

function getSkipListNodeSize(levels: number): number { 
    return normalizeSize(SIZE_DOUBLE + SIZE_POINTER + SIZE_POINTER + (levels * SIZE_SKIPLIST_LEVEL));
}

export function getRandomSkipListNodeSize() { 
    return getSkipListNodeSize(zslRandomLevel());
}

function zslRandomLevel() {
    
    let level = 1;

    while (((Math.random() * 0xFFFFF) & 0xFFFF) < (0.25 * 0xFFFF) && level < MAX_SKIP_LIST_LEVELS) {
        level += 1;
    }

    return level;
}