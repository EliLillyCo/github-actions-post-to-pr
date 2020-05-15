const core = require('@actions/core');
const github = require('@actions/github');
const utils = require('./utils');
const pullRequest = require('./pull_request');
const axios = require('axios');



async function run() {
  try { 

    const octokit = utils.getClient();
    const run = utils.getRun(octokit);
    const token = utils.getToken();


    const definitions = JSON.parse(core.getInput('post_to_pr_definition'));

    var pr_message = ""
    definitions.array.forEach(definition => {
      pr_message += pullRequest.getPrMessage(
        octokit,
        run,
        pullRequest.processDefinition(definition))
    });


    axios.post(github.event.pull_request.comments_url, {
      data: {
        "body": pr_message
      },
      headers: {
        "Authorization": `token ${token}`
      }
    })
    .then((response) => {
      console.log(response);
    }, (error) => {
      core.setFailed(error);
    });

  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
