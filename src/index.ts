type RequestAddress = number|number[];
const normalizeRequestAddress = (addr: RequestAddress) =>
  typeof addr === 'number' ? [addr] : addr;

export default async function Dolphin(url='ws://localhost:35353', reconnect=0) {
  let ws: WebSocket;
  let nextId = 1;
  const reqs = new Map();

  const connect = () => new Promise((rsv, rjt) => {
    ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      console.log(`Connected to ${url}`);
      rsv(ws);
    };
    ws.onerror = err => {
      console.error(err);
      rjt(err);
    };
    ws.onclose = reconnect > 0 ? (() => {
      console.warn(`Connection closed. Try to reconnect after ${reconnect}ms`);
      setTimeout(connect, reconnect);
    }) : (() => console.warn('Connection closed'));
    ws.onmessage = ({data}) => {
      if (typeof data === 'string') return;
      if (data.length < 5) return;
      const dv = new DataView(data);
      const id = dv.getUint32(0);
      // req
      const req = reqs.get(id);
      if (req == null) return;
      reqs.delete(id);
      const [rsv, rjt] = req;
      // parse result
      const code = dv.getUint8(4);
      const body = data.slice(5);
      if (code) {
        rjt({code, body: new TextDecoder().decode(body)});
      } else {
        rsv(body);
      }
    };
  });
  const request = (cmdtype: number, payload?: ArrayBufferLike) => new Promise<ArrayBuffer>((rsv, rjt) => {
    const id = nextId++;
    const buf = new ArrayBuffer(5 + (payload?.byteLength ?? 0));
    const dv = new DataView(buf);
    dv.setUint32(0, id);
    dv.setUint8(4, cmdtype);
    if (payload) new Uint8Array(buf).set(new Uint8Array(payload), 5);
    reqs.set(id, [rsv, rjt]);
    ws.send(buf);
  });

  await connect();
  return {
    connect,
    get ws() {
      return ws;
    },
    async getVersion() {
      const r = await request(0x00);
      return new TextDecoder().decode(r);
    },
    async hook() {
      await request(0x01);
    },
    async readRAM(addr: RequestAddress, size: number) {
      const addrs = normalizeRequestAddress(addr);
      const dv = new DataView(new ArrayBuffer(4+4*addrs.length));
      dv.setUint32(0, size);
      addrs.forEach((e, i) => dv.setUint32(4+4*i, e));
      const r = await request(0x02, dv.buffer);
      return new DataView(r);
    },
    async writeRAM(addr: RequestAddress, value: string|ArrayBufferLike) {
      const addrs = normalizeRequestAddress(addr);
      const content = typeof value === 'string' ?
        new Uint8Array((value.match(/[\da-f]{2}/gi) ?? []).map(h => parseInt(h, 16))) : value;
      // pack size, value
      const size = content.byteLength;
      const dv = new DataView(new ArrayBuffer(4+size+4*addrs.length));
      dv.setUint32(0, size);
      new Uint8Array(dv.buffer).set(new Uint8Array(content), 4);
      // pack addrs
      const i0 = 4+size;
      addrs.forEach((e, i) => dv.setUint32(i0+4*i, e));
      // request
      const r = await request(0x03, dv.buffer);
      return new DataView(r);
    },
  };
}
