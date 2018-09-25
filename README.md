# redis-rdb-analyze

## What can it do?
It can parse Redis RDB files (named dump.rdb by default) and estimate how much memory does each key contribute to the memory consumption of a Redis instance.

## Outputs?
Currently, this module produces 2 JSON files:
* List of keys with name, key type and estimated memory consumption
* Prefix tree, containing all key prefixes, except those, which constitute 1/1000 of the keyspace

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

## Installation

```
> npm install redis-rdb-analyze -g
```

## Usage

```
> redis-rdb-analyze /path/to/rdb/file /path/to/output/folder [-encoding=string encoding]
```