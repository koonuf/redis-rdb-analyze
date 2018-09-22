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

                const keysFile: IFile = { descriptor: keysFileDescriptor, path: pathKeys };
                const prefixTreeFile: IFile = { descriptor: prefixTreeFileDescriptor, path: pathPrefixTree };

                resolve(new ReportsWriter(keysFile, prefixTreeFile));
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

    constructor(private keysFile: IFile, private prefixTreeFile: IFile) { 
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

            writeFile(this.keysFile.descriptor, this.serialize(keys), onWriteEnd);
            writeFile(this.prefixTreeFile.descriptor, this.serialize(prefixTree), onWriteEnd);
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

            unlink(this.keysFile.path, unlinkEnd);
            unlink(this.prefixTreeFile.path, unlinkEnd);
        });
    }

    private serialize(data: any): string { 
        return JSON.stringify(data, null, " ");
    }
}

interface IFile { 
    descriptor: number;
    path: string;
}