const core = require('@actions/core');
const wait = require('./wait');
const assert = require('assert').strict;
const fs = require('fs');
var crypto = require('crypto');
const execSync = require('child_process').execSync;

function formatMarkdownBlock(text) {
  return "'''\n" + text + "\n'''\n"
}


function applyMessageModifier(modifier, message) {
  if (!modifier) {
    return message
  }

  var filename = 'tempfile'+crypto.randomBytes(4).readUInt32LE(0);
  fs.writeFileSync(filename, message);

  return execSync(`cat ${filename} | ${modifier}`)
}


function readArchivedFile(branch, archive_name, file) {

}

function getPrMessage(definition) {

  var message = "";

  message += "# " + definition["title"] + "\n";

  definition["compare_branches"].forEach(branch => {

    message += `## Previous ${branch} branch:\n\n`;

    const data = readArchivedFile(branch,
                                  definition.artifact_name,
                                  defiition.message_file)
                                  
    message += formatMarkdownBlock(
      applyMessageModifier(definition["modifier"], data)
    );


  });

  message += "This change:\n\n";

  const data = fs.readFileSync(definition["message_file"], 'utf8')

  message += formatMarkdownBlock(
              applyMessageModifier(definition["modifier"], data)
            );

  return message
}

function processDefinition(definition) {

  assert.assert(
    "message_file" in definition &&
    "title" in definition,
    "message_file & title must be included in the json definition"
  )
  
  if (!("artifact_name" in definition)) {
    definition["artifact_name"] = definition["title"];
  }

  if (!("compare_branches" in definition)) {
    definition["compare_branches"] = ["master"];
  }

  if (!("modifier" in definition)) {
    definition["modifier"] = null;
  }

  return definition
}


async function run() {
  try { 
    const definitions = JSON.parse(core.getInput('post_to_pr_definition'));

    const pr_message = ""
    definitions.array.forEach(definition => {
      pr_message += getPrMessage(processDefinition(definition))
    });
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
