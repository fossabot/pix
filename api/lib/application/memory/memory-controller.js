const { PassThrough } = require('stream');
const fsp = require('fs').promises;

const heapdump = require('heapdump');
const heapProfile = require('heap-profile');

heapProfile.start();

module.exports = {

  async downloadHeapDump() {
    const generateHeapDumpSnapshot = new Promise((resolve, reject) => {
      heapdump.writeSnapshot(function(err, filename) {
        if (err) {
          console.error('An error occurred: ', err);
          return reject(err);
        }
        console.log('heap dump snapshot written to', filename);
        return resolve(filename);
      });
    });

    const filename = await generateHeapDumpSnapshot;

    const heapSnaphotData = await fsp.readFile(filename);

    const outputStream = new PassThrough();
    outputStream.headers = {
      'Content-Type': 'application/octet-stream;charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    };

    outputStream.write(heapSnaphotData);
    outputStream.end();
    return outputStream;
  },

  async downloadHeapProfile() {
    const generateHeapProfileSnapshot = new Promise((resolve, reject) => {
      heapProfile.write((err, filename) => {
        if (err) {
          console.error('An error occurred: ', err);
          return reject(err);
        }
        console.log('heap profile snapshot written to', filename);
        return resolve(filename);
      });
    });

    const filename = await generateHeapProfileSnapshot;

    const heapSnaphotData = await fsp.readFile(filename);

    const outputStream = new PassThrough();
    outputStream.headers = {
      'Content-Type': 'application/octet-stream;charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    };

    outputStream.write(heapSnaphotData);
    outputStream.end();
    return outputStream;
  },

  garbageHeap() {
    try {
      if (global.gc) {
        global.gc();
        return 'Success';
      }
      console.log('node option "--expose-gc" is not enabled');
      return 'Failure';
    } catch (err) {
      console.error('An error occurred: ', err);
      return err;
    }
  }
};
