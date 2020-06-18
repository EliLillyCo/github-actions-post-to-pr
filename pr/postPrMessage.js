import github from '@actions/github';

export default async (octokit, prNumber, prMessage) => {
  let response;

  try {
    response = await octokit.issues.createComment({ ...github.context.repo, issue_number: prNumber, body: prMessage});
  } catch (error) {
    return error;
  }

  return response.data;
}
