import { createClient, RedisClient } from "redis";

function generate() { 
    
    const client = createClient();

    client.set("test-string", getRandomString(20));
    
    generateHashes(client);
    generateSets(client);
    generateLists(client);
    generateSortedSets(client);
}

function generateHashes(client: RedisClient) { 
    
    for (let i = 0; i < 200; i++) { 
        client.hset("test-long-hash", getRandomString(20), getRandomString(150));
    }

    client.hset("test-short-hash", getRandomString(5), getRandomString(7));
    client.hset("test-short-hash", getRandomString(5), getRandomString(7));
}

function generateSets(client: RedisClient) { 

    for (let i = 0; i < 200; i++) { 
        client.sadd("test-long-set", getRandomString(40));
    }

    client.sadd("test-short-set", (8293).toString(10));
    client.sadd("test-short-set", (2).toString(10));
    client.sadd("test-short-set", (234).toString(10));
}

function generateLists(client: RedisClient) { 

    for (let i = 0; i < 200; i++) { 
        client.rpush("test-long-list", getRandomString(40));
    }

    client.rpush("test-short-list", getRandomString(3));
    client.rpush("test-short-list", getRandomString(2));
}

function generateSortedSets(client: RedisClient) { 

    for (let i = 0; i < 200; i++) { 
        client.zadd("test-long-zset", i * 4291, getRandomString(40));
    }

    client.zadd("test-short-zset", 89, getRandomString(7));
    client.zadd("test-short-zset", 4135314, getRandomString(7));
}

function getRandomString(length: number): string { 
    return String.fromCodePoint(...getRandomCodePoints(length));
}

function getRandomCodePoints(count: number): number[] { 
    
    const result: number[] = new Array(count);
    
    for (let i = 0; i < count; i++) { 
        result[i] = Math.round(Math.random() * 0x10FFFF);
    }

    return result;
}

generate();