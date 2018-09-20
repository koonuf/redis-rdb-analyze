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
    memoryConsumptionPercent?: string;
    children?: IPrefixTreeNode[];
}