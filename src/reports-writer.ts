import * as Bluebird from "bluebird";
import { open as fileOpen, writeFile, unlink } from "fs";
import { IKey, IPrefixTreeNode } from "./schemas";
import { join as pathJoin } from "path";

export function getReportsWriter(targetDir: string): Bluebird<IReportsWriter> { 
    
    return new Bluebird<IReportsWriter>((resolve, reject) => { 

        const pathKeys = pathJoin(targetDir, "keys.json");
        const pathPrefixTree = pathJoin(targetDir, "prefix-tree.json");
        const fileOpenFlags = "wx";

        let keysFileDescriptor: number,
            prefixTreeFileDescriptor: number,
            isRejected = false;
        
        function doReject(error: any) { 
            if (!isRejected) {
                isRejected = true;
                reject("Error opening output file " + error);
            }
        }

        function tryResolve() { 
            if (!isRejected && keysFileDescriptor && prefixTreeFileDescriptor) { 
                resolve(new ReportsWriter(pathKeys, pathPrefixTree));
            }
        }

        fileOpen(pathKeys, fileOpenFlags, (e, fd) => { 
            if (e) {
                doReject(e);
            } else { 
                keysFileDescriptor = fd;
                tryResolve();
            }
        });

        fileOpen(pathPrefixTree, fileOpenFlags, (e, fd) => { 
            if (e) {
                doReject(e);
            } else { 
                prefixTreeFileDescriptor = fd;
                tryResolve();
            }
        });
        
    });
}

export interface IReportsWriter { 
    write: (keys: IKey[], prefixTree: IPrefixTreeNode[]) => Bluebird<any>;
    cancel: () => Bluebird<any>;
}

class ReportsWriter implements IReportsWriter {

    constructor(private keysFilePath: string, private prefixTreeFilePath: string) { 
    }

    write(keys: IKey[], prefixTree: IPrefixTreeNode[]): Bluebird<any> {
        
        return new Bluebird<any>((resolve, reject) => { 

            let isRejected = false;

            function onWriteEnd(error?: any) { 
                if (isRejected) { 
                    return;
                }

                if (error) {
                    isRejected = true;
                    reject(error);
                } else { 
                    resolve();
                }
            }

            writeFile(this.keysFilePath, this.serialize(keys), onWriteEnd);
            writeFile(this.prefixTreeFilePath, this.serialize(prefixTree), onWriteEnd);
        });
    }

    cancel() { 
        return new Bluebird<any>((resolve, reject) => { 

            let isRejected = false;

            function unlinkEnd(error?: any) { 
                if (isRejected) { 
                    return;
                }

                if (error) {
                    isRejected = true;
                    reject(error);
                } else { 
                    resolve();
                }
            }

            unlink(this.keysFilePath, unlinkEnd);
            unlink(this.prefixTreeFilePath, unlinkEnd);
        });
    }

    private serialize(data: any): string { 
        return JSON.stringify(data, null, " ");
    }
}