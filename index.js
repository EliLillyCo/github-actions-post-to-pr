const fs = require('fs');
const core = require('@actions/core');
const artifact = require('@actions/artifact');
const utils = require('./utils');
const pullRequest = require('./pull_request');



async function run() {
  try { 
    const octokit = utils.getClient();

    const actionEvent = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )

    octokit.issues.createComment()

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

    // const artifactClient = artifact.create();
    // for (const definition of definitions) {
    //   await artifactClient.uploadArtifact(definition["artifact_name"], 
    //                                       definition["message_file"], ".")
    // }

  } 
  catch (error) {
    core.setFailed(error);
  }
}

run()
