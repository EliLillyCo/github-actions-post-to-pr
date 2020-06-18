import github from '@actions/github';

export default async (octokit) => {
  const runId = process.env['GITHUB_RUN_ID'];
  const run = await octokit.actions.getWorkflowRun({
    ...github.context.repo,
    run_id: runId,
  });
  return run.data;
}
