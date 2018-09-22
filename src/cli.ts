import { ISettings, IKey, IDumpReadResults, IPrefixTreeNode } from "./schemas";
import { ReaderDriver } from "./reader-driver";
import { getReportsWriter, IReportsWriter } from "./reports-writer";
import { KeyTrie } from "./data-structures/key-trie";
import * as readline from "readline";
import * as Bluebird from "bluebird";
import * as parseArgs from "minimist";

function getPrefixTree(keys: IKey[]): IPrefixTreeNode[] { 

    const keyTrie = new KeyTrie();

    for (const key of keys) { 
        keyTrie.addKey(key);
    }

    return keyTrie.compact();
}

function readDump() { 

    const processArgs = parseArgs(process.argv.slice(2));

    const dumpPath = processArgs._[0];
    const resultPath = processArgs._[1];

    const settings: ISettings = {
        stringEncoding: processArgs.encoding || "utf8"
    };
    
    const reader = new ReaderDriver(dumpPath, settings);
    let readReportProgressTimer: NodeJS.Timer | undefined;

    function logProgress() { 
        rewriteConsoleLine(`Reading dump ${reader.getPercentComplete()}%...`);
    }

    function stopProgressLogging() { 
        if (readReportProgressTimer) { 
            clearInterval(readReportProgressTimer);
            readReportProgressTimer = undefined;
        }
    }

    function finish(error?: any) { 
        
        stopProgressLogging();
        
        if (error) {
            rewriteConsoleLine(error);
        } else { 
            rewriteConsoleLine("done");
        }

        console.log();
        process.exit(0);
    }

    enterCliUi();
    readReportProgressTimer = setInterval(logProgress, 300);

    Bluebird.all([
        reader.read(),
        getReportsWriter(resultPath)
    ]).then((results: [IDumpReadResults, IReportsWriter]) => {

        stopProgressLogging();

        const [dumpResults, reportsWriter] = results;
        
        rewriteConsoleLine(dumpResults.resultsReport);
        console.log();
        rewriteConsoleLine("Building prefix tree...");
        
        const tree = getPrefixTree(dumpResults.keys);

        rewriteConsoleLine("Writing reports...");
        return reportsWriter.write(dumpResults.keys, tree);
      
    }).then(() => { 
        
        finish();

    }).catch(finish);
}

function rewriteConsoleLine(message: string) { 
    const CURSOR_LINE_START = "\u001b[0G";
    const CURSOR_LINE_CLEAR = "\u001b[0K";
    process.stdout.write(CURSOR_LINE_START + CURSOR_LINE_CLEAR + message);
}

function enterCliUi() { 

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode!(true);
    
    process.stdin.on("keypress", (str, key) => {
        if (key && key.sequence === "\u0003") {
            console.log();
            process.exit(0);
        }
    });
}

readDump();