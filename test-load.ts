import { ISettings } from "./schemas";
import { ReaderDriver } from "./reader-driver";
import { writeFileSync } from "fs";

const settings: ISettings = {
    stringEncoding: "utf8"
};

const dumpPath = process.argv[2];
const resultPath = process.argv[3];

const reader = new ReaderDriver(dumpPath, settings);

reader.read()
    .then(() => {
        console.log(reader.report());

        const data = JSON.stringify(reader.getKeys(), null, "  ");
        writeFileSync(resultPath, data);
        
    }).catch((e) => console.error(e));