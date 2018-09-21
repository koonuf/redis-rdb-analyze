import * as Bluebird from "bluebird";
import { open as fileOpen, writeFile } from "fs";
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
            isRejected = true;
            reject(error);
        }

        function tryResolve() { 
            if (!isRejected && keysFileDescriptor && prefixTreeFileDescriptor) { 
                resolve(new ReportsWriter(keysFileDescriptor, prefixTreeFileDescriptor));
            }
        }

        fileOpen(pathKeys, fileOpenFlags, (e, fd) => { 
            if (e) {
                reject(e);
            } else { 
                keysFileDescriptor = fd;
                tryResolve();
            }
        });

        fileOpen(pathPrefixTree, fileOpenFlags, (e, fd) => { 
            if (e) {
                reject(e);
            } else { 
                prefixTreeFileDescriptor = fd;
                tryResolve();
            }
        });
        
    });
}

export interface IReportsWriter { 
    write: (keys: IKey[], prefixTree: IPrefixTreeNode[]) => Bluebird<any>;
}

class ReportsWriter implements IReportsWriter {

    constructor(private keysFileDescriptor: number, private prefixTreeFileDescriptor: number) { 
    }

    write(keys: IKey[], prefixTree: IPrefixTreeNode[]): Bluebird<any> {
        
        return new Bluebird<any>((resolve, reject) => { 

            let isRejected = false;

            function onWriteEnd(error?: any) { 
                if (this.isRejected) { 
                    return;
                }

                if (error) {
                    this.isRejected = true;
                    reject(error);
                } else { 
                    resolve();
                }
            }

            writeFile(this.keysFileDescriptor, this.serialize(keys), onWriteEnd);
            writeFile(this.prefixTreeFileDescriptor, this.serialize(prefixTree), onWriteEnd);
        });
    }

    private serialize(data: any): string { 
        return JSON.stringify(data, null, " ");
    }
}