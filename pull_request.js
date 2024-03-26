const github = require('@actions/github');
const crypto = require('crypto');
const utils = require('./utils');
const assert = require('assert').strict;
const fs = require('fs');
const execSync = require('child_process').execSync;


async function readArchivedFile(octokit, run, branch, archive_name, file, modifier) {

    const workflowId = run["workflow_id"]
  
    const runData = await octokit.actions.listWorkflowRuns({
      ...github.context.repo,
      workflow_id: workflowId,
      branch,
      event: "push",
      status: "completed"
    });
  
    if (!("workflow_runs" in  runData.data)) {
        return "No Workflow Runs";
    }

    const runs = runData.data["workflow_runs"];
  
    if (runs.length <= 0) {
      return "No Workflow Runs";
    }
  
    const runId = runs[0]["id"];
  
    const artifactResp = await octokit.actions.listWorkflowRunArtifacts({
      ...github.context.repo,
      run_id: runId,
    });

    const artifactData = artifactResp.data;

    if (!("artifacts" in  artifactData)) {
        return "No Artifacts";
    }
  
    var download_url = null
    for (const artifact of artifactData["artifacts"]) {
      if (artifact["name"] == archive_name) {
        if (artifact["expired"]) {
          return "Artifact has expired";
        } else {
          download_url = artifact["archive_download_url"];
          break;
        }
      }
    }
  
    if (!download_url) {
      return "No Artifacts";
    }
  
    const token = utils.getToken();
    const tempFile = 'tempfile'+crypto.randomBytes(4).readUInt32LE(0);
    execSync(`curl -L -H "Authorization: token ${token}" ${download_url} -o ${tempFile}`)
    var cmd = `unzip -p ${tempFile}`

    if (modifier != null) {
        cmd += ` | ${modifier}`
    }

    const output = execSync(cmd).toString()

    fs.unlinkSync(tempFile)

    return output
  }
  
async function getPrMessageBlock(octokit, run, definition) {

    var message = "";

    message += "##### " + definition["title"] + "\n";

    for (const branch of definition["compare_branches"]) {
        message += `###### Previous ${branch} branch:\n\n`;

        const data = await readArchivedFile(octokit, run, branch,
                                    definition.artifact_name,
                                    definition.message_file,
                                    definition.modifier)

        message += utils.formatMarkdownBlock(
        data,
        definition.collapsible
        );
    }

    message += "\n###### This change:\n\n";

    const data = fs.readFileSync(definition["message_file"], 'utf8')

    message += utils.formatMarkdownBlock(
                utils.applyMessageModifier(data, definition["modifier"]),
                definition.collapsible
                );

    return message
}
  
function processDefinition(definition) {

assert(
    "message_file" in definition &&
    "title" in definition,
    "message_file & title must be included in the json definition"
)

if (!("artifact_name" in definition)) {
    definition["artifact_name"] = definition["title"]
    .replace(/[^0-9a-z ]/gi, "")
    .replace(/ /g, "-")
    .toLowerCase();
}

if (!("compare_branches" in definition)) {
    definition["compare_branches"] = ["master"];
}

if (!("modifier" in definition)) {
    definition["modifier"] = null;
}

if (!("collapsible" in definition)) {
  definition["collapsible"] = false;
}

return definition
}


async function getPrMessage(octokit, definitions) {

    const run = await utils.getRun(octokit);

    var prMessage = ""
    for (const definition of definitions) { 
        prMessage += await getPrMessageBlock(
            octokit,
            run,
            definition)
    }

    return prMessage
}


async function postPrMessage(octokit, prNumber, prMessage) {
    const res = await octokit.issues.createComment({
        ...github.context.repo,
        issue_number: prNumber,
        body: prMessage,
      });

    return res.data;
}


module.exports = {
    readArchivedFile,
    getPrMessageBlock,
    getPrMessage,
    processDefinition,
    postPrMessage
}
