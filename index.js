const fs = require('fs');
const core = require('@actions/core');
const utils = require('./utils');
const pullRequest = require('./pull_request');



async function run() {
  try { 
    const octokit = utils.getClient();

    const actionEvent = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )

    const rawDefinition = core.getInput('post_to_pr_definition');
    var definitions;
    try{
      definitions = JSON.parse(rawDefinition);
    } catch(error) {
      core.setFailed(`Erro parsing json config \n${rawDefinition}\n error : ${error}`);
      return
    }

    definitions = definitions.map(pullRequest.processDefinition)

    var prMessage = await pullRequest.getPrMessage(octokit, definitions);


    await pullRequest.postPrMessage(
      octokit,
      actionEvent.pull_request.number,
      prMessage
    )

    await pullRequest.uploadArtifacts(definitions);

  } 
  catch (error) {
    core.setFailed(error);
  }
}

run()
