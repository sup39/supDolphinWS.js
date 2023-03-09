/* eslint-env browser */
/* global Dolphin */
/* eslint-disable require-atomic-updates */

document.addEventListener('DOMContentLoaded', async () => {
  function main(dolphin) {
    const MEM1_START = 0x80000000;
    const MEM1_END   = 0x81800000;
    const MEM2_START = 0x90000000;
    const MEM2_END   = 0x93000000;
    const rowCount = 16;
    const cellCount = 16 * rowCount;

    const ctn = document.querySelector('#mem-waffle');

    const tr0 = document.createElement('tr');
    ctn.appendChild(tr0);
    const th0 = document.createElement('th');
    tr0.appendChild(th0);
    const ths = Array(16).fill().map(() => {
      const th = document.createElement('th');
      tr0.appendChild(th);
      return th;
    });

    const trs = Array(rowCount).fill().map(() => {
      const tr = document.createElement('tr');
      ctn.appendChild(tr);
      return tr;
    });
    const tdAddrs = Array(16).fill().map((_, i) => {
      const td = document.createElement('td');
      trs[i].appendChild(td);
      return td;
    });
    const tdVals = Array(cellCount).fill().map((_, i) => {
      const td = document.createElement('td');
      trs[i>>4].appendChild(td);
      return td;
    });
    function hex(x, size) {
      const s = x.toString(16).toUpperCase();
      return size ? s.padStart(size<<1, '0') : s;
    }

    const valCDs = tdVals.map(() => 0);
    let values = tdVals.map(() => '??');

    let startAddr = MEM1_START;
    const divAPIMsg = document.querySelector('#api-msg');
    const state = {
      get startAddr() {
        return startAddr;
      },
      set startAddr(addr) {
        startAddr = addr;
        tdAddrs.forEach(td => {
          td.innerText = hex(addr, 4);
          addr += 0x10;
        });
        ths.forEach((th, i) => th.textContent =
          `.${((addr+i)&0xf).toString(16).toUpperCase()}`);
        this.update(true);
      },
      get values() {
        return values;
      },
      async update(addrChanged=false) {
        const dv = await dolphin.readRAM(startAddr, 0x100).then(r => {
          divAPIMsg.textContent = '';
          return r;
        }, err => {
          divAPIMsg.textContent = err.body;
          return null;
        });
        if (dv == null) {
          tdVals.forEach(td => td.innerText = '??');
        } else {
          const arr = new Uint8Array(dv.buffer);
          tdVals.forEach((td, i) => {
            const v = hex(arr[i], 1);
            if (!addrChanged) {
              valCDs[i] = v !== td.innerText ? 80 :
                valCDs[i] > 5 ? valCDs[i] -= 2 : 0;
              td.style.background = `rgba(255,0,0,${valCDs[i]/100})`;
            }
            td.textContent = hex(v, 1);
          });
        }
      },
    };

    const inputAddr = document.querySelector('#input-addr');
    inputAddr.addEventListener('input', () => {
      const val = parseInt(inputAddr.value, 16);
      if (
        MEM1_START <= val && val < MEM1_END ||
        MEM2_START <= val && val < MEM2_END
      ) {
        state.startAddr = val;
      }
    });
    inputAddr.value = startAddr.toString(16).toUpperCase();
    state.startAddr = startAddr;

    // loop
    const dtMin = 33; // update at most 30fps
    let t0 = performance.now();
    async function loop(t) {
      const dt = t-t0;
      if (dt >= dtMin) {
        await state.update();
        t0 = t;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    // expose
    window.state = state;
  }

  const inputURL = document.querySelector('#input-url');
  const btnConnect = document.querySelector('#btn-connect');
  const divConnMsg = document.querySelector('#conn-msg');
  function lockConfig(isLock) {
    btnConnect.disabled = isLock;
    inputURL.disabled = isLock;
  }
  function setup() {
    lockConfig(true);
    /** @type {string} */
    let url = inputURL.value;
    if (!url.includes('://')) url = 'ws://'+url;
    Dolphin(url).then(dolphin => {
      main(window.dolphin = dolphin);
      document.querySelector('#sec-main').classList.remove('hidden');
      lockConfig(true);
      divConnMsg.textContent = 'Connected';
    }, () => {
      lockConfig(false);
      divConnMsg.textContent = 'Fail to connect to server';
    });
  }
  document.querySelector('#form-conf').addEventListener('submit', e => {
    e.preventDefault();
    setup();
  });
  const url0 = new URL(window.location.href).searchParams.get('url');
  if (url0) {
    inputURL.value = url0;
    setup();
  }
});
