# redis-rdb-analyze

## What can it do?
It can parse Redis RDB files (named dump.rdb by default) and estimate how much memory does each key contribute to the memory consumption of a Redis instance.

## Installation

```
> npm install redis-rdb-analyze -g
```

## Usage

```
> redis-rdb-analyze /path/to/rdb/file /path/to/output/folder [-encoding=string encoding]
```

## Outputs?
Currently, this module produces 2 JSON files:
* List of keys with name, key type and estimated memory consumption (numbers are bytes)
* Prefix tree, containing all key prefixes, except those which represent less than 1/1000 of the keyspace (this helps making the prefix tree readable in text editors)

### Key list example

```json
[
 {
  "key": "test-long-set",
  "size": 50256,
  "keyType": "LARGE_SET"
 },
 {
  "key": "test-short-hash",
  "size": 192,
  "keyType": "SMALL_HASH"
 },
 {
  "key": "test-short-list",
  "size": 128,
  "keyType": "SMALL_LIST"
 }
]
```

### Prefix tree example
```json
[
 {
  "prefix": "test-",
  "memory": "100%",
  "children": [
   {
    "prefix": "test-long-",
    "memory": "99.7%",
    "children": [
     {
      "prefix": "test-long-hash",
      "memory": "50.2%"
     },
     {
      "prefix": "test-long-zset",
      "memory": "19.1%"
     }
    ]
   },
   {
    "prefix": "test-short-",
    "memory": "0.3%"
   }
  ]
 }
]
```

## Redis/RDB version support
Currently, this module only supports RDB version 6 and Redis 3.0.x. Each version of Redis slightly changes/optimizes internal
data structures and memory allocation patterns. Also, the default memory allocator (jemalloc) might change its memory block sizes,
which affects memory usage estimation precision.

## The precision of memory usage estimates
The idea of this module is to try to break down the memory consumption, as reported by Redis INFO command, into individual keys and 
key prefixes. It should help understanding where is memory consumed so that memory usage could be optimized. 

This module is based on the source code of Redis and it tries to emulate the logic of RDB load process. It also takes into account 
jemalloc memory block sizes, so estimates are as close to real life as possible (apart from yet unfixed bugs). 
My tests with production keyspaces of different sizes show that this module is about 99.5% close to what is actually reported by Redis
after it is restarted with corresponding RDB file.

Unfortunately its impossible to be 100% precise, especially if large sorted sets are involved, as there is a randomization algorithm in the level each skiplist entry is assigned to.

## CLI arguments
Currently, only one optional parameter (string encoding) is supported. It is "utf8" by default, which is the string encoding used by node.js Redis client, so it can be safely omitted.

## Future development
Is there something you'd like to be changed or added to the functionality? Please let me know if you are interested.
