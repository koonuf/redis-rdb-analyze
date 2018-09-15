import { ISettings } from "./schemas";
import { ReaderDriver } from "./reader-driver";

const settings: ISettings = {
    stringEncoding: "utf8"
};

const filePath = process.argv[2];

const reader = new ReaderDriver(filePath, settings);

reader.read()
    .then(() => console.log(reader.report()))
    .catch((e) => console.error(e));