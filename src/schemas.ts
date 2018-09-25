export interface ISettings { 
    stringEncoding: string;
}

export interface IKey { 
    key: string;
    keyType: string;
    size: number;
}

export interface IPrefixTreeNode { 
    prefix?: string;
    memory?: string;
    children?: IPrefixTreeNode[];
}

export class IDumpReadResults { 
    byteCount: number;
    keys: IKey[];
    resultsReport: string;
}