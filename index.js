import fs from 'fs';
import core from '@actions/core';

import * as utils from './utils/index.js';
import * as pullRequest from './pr/index.js';

async function run() {
  try {
    const octokit = utils.getClient();

    const actionEvent = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )

    const rawDefinition = core.getInput('post_to_pr_definition');
    let definitions;
    try{
      definitions = JSON.parse(rawDefinition);
    } catch(error) {
      core.setFailed(`Erro parsing json config \n${rawDefinition}\n error : ${error}`);
      return
    }

    definitions = definitions.map(pullRequest.processDefinition)


    if (actionEvent.pull_request) {
      let prMessage = await pullRequest.getPrMessage(octokit, definitions);

      await pullRequest.postPrMessage(octokit, actionEvent.pull_request.number, prMessage)
    }

    await utils.uploadArtifacts(definitions);

  }
  catch (error) {
    core.setFailed(error);
  }
}

run()
