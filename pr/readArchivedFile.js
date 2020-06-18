import fs from 'fs';
import github from '@actions/github';
import crypto from 'crypto';
import child_process from 'child_process';

import { getToken } from '../utils/index.js'

const execSync = child_process.execSync;

export default async (octokit, run, branch, archive_name, file, modifier) => {

    const workflowId = run["workflow_id"]

    const runData = await octokit.actions.listWorkflowRuns({
      ...github.context.repo,
      workflow_id: workflowId,
      branch,
      event: "push",
      status: "conclusion"
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
        download_url = artifact["archive_download_url"]
        break
      }
    }

    if (!download_url) {
      return "No Artifacts";
    }

    const token = getToken();
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
