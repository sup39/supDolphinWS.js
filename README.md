# supDolphinWS.js
A WebSocket client API library to access memory of emulated games in Dolphin.

This library is meant to be used with [supDolphinWS-server](https://github.com/sup39/supDolphinWS-server)

## Usage
### Installation (for Browser)
Add the following line to your HTML file
```html
<script src="https://cdn.sup39.dev/js/supDolphinWS@0.1.0/index.min.js"></script>
```

### API
```javascript
async function main() {
  /**
   * Connect to supDolphinWS server
   * You can also specify the URL to the supDolphinWS server
   * The default URL is 'ws://localhost:35353'
   * Example:
   * > const dolphin = await Dolphin('ws://localhost:35354');
   */
  const dolphin = await Dolphin();
  // expose it as global variable for debug purpose
  window.dolphin = dolphin;

  // symbol map // TODO check version + load from csv
  const S = {
    gpMarioOriginal: 0x8040A378,
    gpMarDirector: 0x8040A2A8,
  };
  // expose it as global variable for debug purpose
  window.S = S;

  /**
   * Read memory
   * > readRAM(addr: number|number[], size: number): Promise<DataView>
   * The `addr` argument can be a number array to represent pointer+offsets
   * The value of the returned Promise is a DataView object of the content in RAM
   * The DataView will have size 0 if the address is not valid
   */
  // read the pointer to Mario's instance
  const dvMario = await dolphin.readRAM(S.gpMarioOriginal, 4);
  console.log('gpMarioOriginal:', dvMario.getUint32(0).toString(16).toUpperCase());
  // read Mario's position (x, y, z)
  const dvMPos = await dolphin.readRAM([S.gpMarioOriginal, 0x10], 12);
  if (dvMPos.byteLength > 0) {
    const x = dvMPos.getFloat32(0);
    const y = dvMPos.getFloat32(4);
    const z = dvMPos.getFloat32(8);
    console.log(`Mario's position: ${x} ${y} ${z}`);
  } else {
    console.log(`Cannot get Mario's position`);
  }

  /**
   * Write memory
   * > writeRAM(addr: number|number[], value: string|ArrayBufferLike): Promise<DataView>
   * The `addr` argument can be a number array to represent pointer+offsets
   * The `value` argument can be a hex string or an ArrayBufferLike (including Uint8Array etc.)
   * The value of the returned Promise is a DataView object of the written 32-bit address
   * The DataView will have size 0 if the address is not valid
   */
  // read current global QF
  const dvGlobalQF = await dolphin.readRAM([S.gpMarDirector, 0x5C], 4);
  // write current global QF to QFT freeze time
  await dolphin.writeRAM(0x817F00B8, dvGlobalQF.buffer);
  // set QFT freeze duration to 45 frame
  const dvFreezeDur = new DataView(new ArrayBuffer(4));
  dvFreezeDur.setUint32(0, 45); // setUint32(offset, value)
  await dolphin.writeRAM(0x817F00BC, dvFreezeDur.buffer);
  // You can also pass hex string as `value` argument
  // await dolphin.write(0x817F00BC, '0000002D');

  /**
   * Hook Dolphin
   * > hook()
   * If you restart Dolphin, you will need to call this function to reinitialize the shared memory of Dolphin
   * You can also simply just ask your user to refresh the page though
   */
  await dolphin.hook();
}
main();
```
