import { getRun } from '../utils/index.js';
import { getPrMessageBlock } from './index.js';

export default async (octokit, definitions) => {
  let run;
  let prMessage = ""

  try {
    run = await getRun(octokit);
  } catch (error) {
    return error;
  }

  for (const definition of definitions) {
      prMessage += await getPrMessageBlock(octokit, run, definition)
  }

  return prMessage
}
