import fs from 'fs';
import crypto from 'crypto';
import child_process from 'child_process';

const execSync = child_process.execSync;

export default (message, modifier) => {
  if (!modifier) {
    return message
  }
  const filename = 'tempfile'+crypto.randomBytes(4).readUInt32LE(0);
  fs.writeFileSync(filename, message);
  const response = execSync(`cat ${filename} | ${modifier}`).toString()
  fs.unlinkSync(filename)
  return response
}
