export type RequestAddress = number | number[];
export declare const normalizeRequestAddress: (addr: RequestAddress) => number[];
export declare const getRequestAddressPath: (addr: RequestAddress) => string;
export declare const http: ({ method, url, body, contentType, responseType }: {
    method: string;
    url: string | URL;
    body?: Parameters<XMLHttpRequest['send']>[0];
    contentType?: string | undefined;
    responseType?: XMLHttpRequestResponseType | undefined;
}) => Promise<XMLHttpRequest>;
