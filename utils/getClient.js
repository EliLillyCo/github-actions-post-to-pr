import github from '@actions/github';

import { getToken } from './index.js'

export default () => {
  const token = getToken();
  return new github.GitHub(token);
}
