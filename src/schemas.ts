export interface ISettings { 
    stringEncoding: string;
}

export interface IKey { 
    key: string;
    keyType: string;
    size: number;
}

export interface IPrefixQuery { 
    topCount: number;
    abovePercent: number;
}

export interface IPrefix { 
    prefix: string;
    size: number;
}