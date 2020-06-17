const fs = require('fs');
const execSync = require('child_process').execSync;
const crypto = require('crypto');
const github = require('@actions/github');
const core = require('@actions/core');
const artifact = require('@actions/artifact');


function formatMarkdownBlock(text, collapsible) {
  if (collapsible) {
return `<details><summary>Expand</summary>
<br>

\`\`\`
${text}
\`\`\`
</details>
`
  } else {
return `\`\`\`
${text}
\`\`\`
`
  }
}

function applyMessageModifier(message, modifier) {
  if (!modifier) {
    return message
  }

  var filename = 'tempfile'+crypto.randomBytes(4).readUInt32LE(0);
  fs.writeFileSync(filename, message);

  const re = execSync(`cat ${filename} | ${modifier}`).toString()

  fs.unlinkSync(filename)

  return re
}

async function getRun(octokit) {
  const runId = process.env['GITHUB_RUN_ID'];

  const run = await octokit.actions.getWorkflowRun({
    ...github.context.repo,
    run_id: runId,
  });
  return run.data;
}

function getToken() {
  return core.getInput('github_token');
}

function getClient() {
  const token = getToken();
  
  return new github.GitHub(token);
}

async function uploadArtifacts(definitions) {
  const artifactClient = artifact.create();
  for (const definition of definitions) {
    await artifactClient.uploadArtifact(definition["artifact_name"], 
                                        [
                                          definition["message_file"]
                                        ],
                                        ".")
  }
}


module.exports = {
  formatMarkdownBlock,
  applyMessageModifier,
  getRun,
  getToken,
  getClient,
  uploadArtifacts
}
