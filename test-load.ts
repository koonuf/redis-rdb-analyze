import { ISettings, IKey } from "./src/schemas";
import { ReaderDriver } from "./src/reader-driver";
import { writeFileSync, readFileSync } from "fs";
import { KeyTrie } from "./src/data-structures/key-trie";

const settings: ISettings = {
    stringEncoding: "utf8"
};

const cmd = process.argv[2];

if (cmd === "read") {
    readDump();

} else if (cmd === "analyze") {
    analyzeDump(process.argv[3], process.argv[4]);

}

function analyzeDump(jsonPath: string, resultPath: string) { 

    const keys: IKey[] = JSON.parse(readFileSync(jsonPath, "utf8"));

    console.log(`Read ${keys.length} keys`);

    const keyTrie = new KeyTrie();

    for (const key of keys) { 
        keyTrie.addKey(key);
    }

    console.log(`Built trie`);

    const result = keyTrie.compact();

    writeFileSync(resultPath, JSON.stringify(result, null, " "));

   // 

    // const prefixes = keyTrie.search({ topCount: 20, abovePercent: 1 });

    // console.log(JSON.stringify(prefixes, null, " "));
}

function readDump() { 
    const dumpPath = process.argv[3];
    const resultPath = process.argv[4];
    
    const reader = new ReaderDriver(dumpPath, settings);
    
    reader.read()
        .then(() => {
            console.log(reader.report());
    
            const data = JSON.stringify(reader.getKeys(), null, "  ");
            writeFileSync(resultPath, data);
            
        }).catch((e) => console.error(e));
}
