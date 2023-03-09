type RequestAddress = number | number[];
export default function Dolphin(url?: string, reconnect?: number): Promise<{
    connect: () => Promise<unknown>;
    readonly ws: WebSocket;
    getVersion(): Promise<string>;
    hook(): Promise<void>;
    readRAM(addr: RequestAddress, size: number): Promise<DataView>;
    writeRAM(addr: RequestAddress, value: string | ArrayBufferLike): Promise<DataView>;
}>;
export {};
