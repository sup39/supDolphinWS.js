'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var normalizeRequestAddress = function (addr) {
    return typeof addr === 'number' ? [addr] : addr;
};
function Dolphin(url, reconnect) {
    if (url === void 0) { url = 'ws://localhost:35353'; }
    if (reconnect === void 0) { reconnect = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var ws, nextId, reqs, connect, request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nextId = 1;
                    reqs = new Map();
                    connect = function () { return new Promise(function (rsv, rjt) {
                        ws = new WebSocket(url);
                        ws.binaryType = 'arraybuffer';
                        ws.onopen = function () {
                            console.log("Connected to ".concat(url));
                            rsv(ws);
                        };
                        ws.onerror = function (err) {
                            console.error(err);
                            rjt(err);
                        };
                        ws.onclose = reconnect > 0 ? (function () {
                            console.warn("Connection closed. Try to reconnect after ".concat(reconnect, "ms"));
                            setTimeout(connect, reconnect);
                        }) : (function () { return console.warn('Connection closed'); });
                        ws.onmessage = function (_a) {
                            var data = _a.data;
                            if (typeof data === 'string')
                                return;
                            if (data.length < 5)
                                return;
                            var dv = new DataView(data);
                            var id = dv.getUint32(0);
                            // req
                            var req = reqs.get(id);
                            if (req == null)
                                return;
                            reqs.delete(id);
                            var rsv = req[0], rjt = req[1];
                            // parse result
                            var code = dv.getUint8(4);
                            var body = data.slice(5);
                            if (code) {
                                rjt({ code: code, body: new TextDecoder().decode(body) });
                            }
                            else {
                                rsv(body);
                            }
                        };
                    }); };
                    request = function (cmdtype, payload) { return new Promise(function (rsv, rjt) {
                        var _a;
                        var id = nextId++;
                        var buf = new ArrayBuffer(5 + ((_a = payload === null || payload === void 0 ? void 0 : payload.byteLength) !== null && _a !== void 0 ? _a : 0));
                        var dv = new DataView(buf);
                        dv.setUint32(0, id);
                        dv.setUint8(4, cmdtype);
                        if (payload)
                            new Uint8Array(buf).set(new Uint8Array(payload), 5);
                        reqs.set(id, [rsv, rjt]);
                        ws.send(buf);
                    }); };
                    return [4 /*yield*/, connect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, {
                            connect: connect,
                            get ws() {
                                return ws;
                            },
                            getVersion: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var r;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, request(0x00)];
                                            case 1:
                                                r = _a.sent();
                                                return [2 /*return*/, new TextDecoder().decode(r)];
                                        }
                                    });
                                });
                            },
                            hook: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, request(0x01)];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            readRAM: function (addr, size) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var addrs, dv, r;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                addrs = normalizeRequestAddress(addr);
                                                dv = new DataView(new ArrayBuffer(4 + 4 * addrs.length));
                                                dv.setUint32(0, size);
                                                addrs.forEach(function (e, i) { return dv.setUint32(4 + 4 * i, e); });
                                                return [4 /*yield*/, request(0x02, dv.buffer)];
                                            case 1:
                                                r = _a.sent();
                                                return [2 /*return*/, new DataView(r)];
                                        }
                                    });
                                });
                            },
                            writeRAM: function (addr, value) {
                                var _a;
                                return __awaiter(this, void 0, void 0, function () {
                                    var addrs, content, size, dv, i0, r;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                addrs = normalizeRequestAddress(addr);
                                                content = typeof value === 'string' ?
                                                    new Uint8Array(((_a = value.match(/[\da-f]{2}/gi)) !== null && _a !== void 0 ? _a : []).map(function (h) { return parseInt(h, 16); })) : value;
                                                size = content.byteLength;
                                                dv = new DataView(new ArrayBuffer(4 + size + 4 * addrs.length));
                                                dv.setUint32(0, size);
                                                new Uint8Array(dv.buffer).set(new Uint8Array(content), 4);
                                                i0 = 4 + size;
                                                addrs.forEach(function (e, i) { return dv.setUint32(i0 + 4 * i, e); });
                                                return [4 /*yield*/, request(0x03, dv.buffer)];
                                            case 1:
                                                r = _b.sent();
                                                return [2 /*return*/, new DataView(r)];
                                        }
                                    });
                                });
                            },
                        }];
            }
        });
    });
}

module.exports = Dolphin;
//# sourceMappingURL=index.cjs.js.map
