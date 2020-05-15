const {onExit} = require('@rauschma/stringio');
const {spawn} = require('child_process');
const execSync = require('child_process').execSync;

async function main() {

  const childProcess = spawn('cat', [filePath],
    {stdio: [process.stdin, process.stdout, process.stderr]}); // (A)

  await onExit(childProcess); // (B)

  console.log('### DONE');
}
main();


function onExit(childProcess) {
    return new Promise((resolve, reject) => {
      childProcess.once('exit', (code, signal) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error('Exit with error code: ' + code));
        }
      });
      childProcess.once('error', (err) => {
        reject(err);
      });
    });
  }