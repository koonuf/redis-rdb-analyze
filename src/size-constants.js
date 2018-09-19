"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BITS_IN_BYTE = 8;
exports.KB = 1024;
exports.MB = exports.KB * exports.KB;
const NORMALIZE_SIZE_BY = 64 / BITS_IN_BYTE;
exports.SIZE_POINTER = 64 / BITS_IN_BYTE;
exports.LONG_MIN = -9223372036854775808;
exports.LONG_MAX = 9223372036854775807;
exports.SIZE_INT = 32 / BITS_IN_BYTE;
exports.SIZE_LONG = 64 / BITS_IN_BYTE;
exports.SIZE_DOUBLE = 64 / BITS_IN_BYTE;
const SIZE_LRU = 24 / BITS_IN_BYTE;
exports.SIZE_OBJECT = normalizeSize(((4 + 4) / BITS_IN_BYTE) + SIZE_LRU + exports.SIZE_INT + exports.SIZE_POINTER);
exports.SIZE_STRING_HEADER = normalizeSize(exports.SIZE_INT + exports.SIZE_INT);
exports.SIZE_SKIPLIST_LEVEL = normalizeSize(exports.SIZE_INT + exports.SIZE_POINTER);
exports.SIZE_SKIP_LIST = normalizeSize(exports.SIZE_POINTER + exports.SIZE_POINTER + exports.SIZE_LONG + exports.SIZE_INT);
exports.SIZE_ZSET = normalizeSize(exports.SIZE_POINTER + exports.SIZE_POINTER);
const SIZE_DICT_HASH_TABLE = exports.SIZE_POINTER + (exports.SIZE_LONG * 3);
exports.SIZE_DICT = normalizeSize(exports.SIZE_POINTER + exports.SIZE_POINTER + (SIZE_DICT_HASH_TABLE * 2) + exports.SIZE_LONG + exports.SIZE_INT);
const MAX_SKIP_LIST_LEVELS = 32;
exports.SIZE_SKIPLIST_HEAD_NODE = getSkipListNodeSize(MAX_SKIP_LIST_LEVELS);
exports.SIZE_DICT_ENTRY = normalizeSize(exports.SIZE_POINTER + exports.SIZE_POINTER + exports.SIZE_DOUBLE);
exports.SIZE_LIST = normalizeSize((5 * exports.SIZE_POINTER) + exports.SIZE_LONG);
exports.SIZE_LIST_NODE = normalizeSize(3 * exports.SIZE_POINTER);
function normalizeSize(size) {
    if (size & (NORMALIZE_SIZE_BY - 1)) {
        size += (NORMALIZE_SIZE_BY - (size & (NORMALIZE_SIZE_BY - 1)));
    }
    return size;
}
function getSkipListNodeSize(levels) {
    return normalizeSize(exports.SIZE_DOUBLE + exports.SIZE_POINTER + exports.SIZE_POINTER + (levels * exports.SIZE_SKIPLIST_LEVEL));
}
function getRandomSkipListNodeSize() {
    return getSkipListNodeSize(zslRandomLevel());
}
exports.getRandomSkipListNodeSize = getRandomSkipListNodeSize;
function zslRandomLevel() {
    let level = 1;
    while (((Math.random() * 0xFFFFF) & 0xFFFF) < (0.25 * 0xFFFF) && level < MAX_SKIP_LIST_LEVELS) {
        level += 1;
    }
    return level;
}
//# sourceMappingURL=size-constants.js.map