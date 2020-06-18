import core from '@actions/core';

export default () => {
  return core.getInput('github_token');
}
