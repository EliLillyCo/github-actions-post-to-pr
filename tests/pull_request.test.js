import process from 'process';
import octokitFixtures from '@octokit/fixtures';
import github from '@actions/github';
import crypto from 'crypto';
import fs from 'fs';
import child_process from 'child_process';

import * as pr from './pr/index.js';

const execSync = child_process.execSync;

const env = Object.assign({}, process.env);
const testLogFile = 'tempfile'+crypto.randomBytes(4).readUInt32LE(0);
const testLogFileMessage = `logline1
logline2

logline4
logline5`

beforeAll(() => {
    fs.writeFileSync(testLogFile, testLogFileMessage);
    execSync(`zip ${testLogFile}.zip ${testLogFile}`)
});

afterAll(() => {
    process.env = env;
    fs.unlinkSync(testLogFile)
    fs.unlinkSync(testLogFile + ".zip")
});

test('process definition', async() => {

    expect(pr.processDefinition({
        "message_file": "./some_file.txt",
        "title": "Some Test Title",
    })).toEqual({
        "message_file": "./some_file.txt",
        "title": "Some Test Title",
        "artifact_name": "some-test-title",
        "collapsible": false,
        "modifier": null,
        "compare_branches": ["master"]
    });

    expect(pr.processDefinition({
        "message_file": "./some_file.txt",
        "title": "Some Test Title",
        "artifact_name": "some-test-title-other",
        "modifier": "some-command",
        "compare_branches": ["new-feature"]
    })).toEqual({
        "message_file": "./some_file.txt",
        "title": "Some Test Title",
        "artifact_name": "some-test-title-other",
        "collapsible": false,
        "modifier": "some-command",
        "compare_branches": ["new-feature"]
    });
});


test('test get pull request message no branch runs', async() => {

    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"

    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/workflows/12345/runs?branch=master&event=push&status=conclusion")
    .reply(200, {
        "workflow_runs": []
    });


    expect(await pr.getPrMessageBlock(
        new github.GitHub("1234"),
        {
            "workflow_id": 12345
        },
        {
            "message_file": "./" + testLogFile,
            "title": "Some Test Title",
            "artifact_name": "some-test-title",
            "modifier": null,
            "compare_branches": ["master"]
        })).toEqual(
    `# Some Test Title
## Previous master branch:

\`\`\`
No Workflow Runs
\`\`\`

## This change:

\`\`\`
logline1
logline2

logline4
logline5
\`\`\`
`);

});


test('test get pull request message no artifacts', async() => {

    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/workflows/1234/runs?branch=master&event=push&status=conclusion")
    .reply(200, {
        "workflow_runs": [{"id": 12345}]
    });
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/12345/artifacts")
    .reply(200, {
        "artifacts": []
    });

expect(await pr.getPrMessageBlock(
    new github.GitHub("1234"),
    {
        "workflow_id": 1234
    },
    {
        "message_file": "./" + testLogFile,
        "title": "Some Test Title",
        "artifact_name": "some-test-title",
        "modifier": null,
        "compare_branches": ["master"]
    })).toEqual(
`# Some Test Title
## Previous master branch:

\`\`\`
No Artifacts
\`\`\`

## This change:

\`\`\`
logline1
logline2

logline4
logline5
\`\`\`
`);

});


test('test get pull request message without modifier', async() => {

    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/workflows/1234/runs?branch=master&event=push&status=conclusion")
    .reply(200, {
        "workflow_runs": [{"id": 12345}]
    });
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/12345/artifacts")
    .reply(200, {
        "total_count": 1,
        "artifacts": [
            {
                "name": "some-test-title",

                "archive_download_url": `file:///${__dirname}/${testLogFile}.zip`
            }
        ]
    });

expect(await pr.getPrMessageBlock(
    new github.GitHub("1234"),
    {
        "workflow_id": 1234
    },
    {
        "message_file": "./" + testLogFile,
        "title": "Some Test Title",
        "artifact_name": "some-test-title",
        "modifier": null,
        "compare_branches": ["master"]
    })).toEqual(
`# Some Test Title
## Previous master branch:

\`\`\`
logline1
logline2

logline4
logline5
\`\`\`

## This change:

\`\`\`
logline1
logline2

logline4
logline5
\`\`\`
`);

});

test('test get pull request with modifier', async() => {

    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/workflows/1234/runs?branch=master&event=push&status=conclusion")
    .reply(200, {
        "workflow_runs": [{"id": 12345}]
    });
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/12345/artifacts")
    .reply(200, {
        "total_count": 1,
        "artifacts": [
            {
                "name": "some-test-title",

                "archive_download_url": `file:///${__dirname}/${testLogFile}.zip`
            }
        ]
    });

expect(await pr.getPrMessageBlock(
    new github.GitHub("1234"),
    {
        "workflow_id": 1234
    },
    {
        "message_file": "./" + testLogFile,
        "title": "Some Test Title",
        "artifact_name": "some-test-title",
        "modifier": "grep logline1",
        "compare_branches": ["master"]
    })).toEqual(
`# Some Test Title
## Previous master branch:

\`\`\`
logline1

\`\`\`

## This change:

\`\`\`
logline1

\`\`\`
`);

});


test('test get pull request message with modifier', async() => {

    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"

    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/123")
    .reply(200,     {
        "workflow_id": 1234
    });

    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/workflows/1234/runs?branch=master&event=push&status=conclusion")
    .reply(200, {
        "workflow_runs": [{"id": 12345}]
    });
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/12345/artifacts")
    .reply(200, {
        "total_count": 1,
        "artifacts": [
            {
                "name": "some-test-title",

                "archive_download_url": `file:///${__dirname}/${testLogFile}.zip`
            }
        ]
    });

expect(await pr.getPrMessage(
    new github.GitHub("1234"),
    [{
        "message_file": "./" + testLogFile,
        "title": "Some Test Title",
        "artifact_name": "some-test-title",
        "modifier": "grep logline1",
        "compare_branches": ["master"]
    }])).toEqual(
`# Some Test Title
## Previous master branch:

\`\`\`
logline1

\`\`\`

## This change:

\`\`\`
logline1

\`\`\`
`);

});


test('post message', async() => {

    octokitFixtures.nock("https://api.github.com")
    .post("/repos/test/test/issues/123/comments")
    .reply(200,     {
        "id": 1
    });



    expect(await pr.postPrMessage(
        new github.GitHub("1234"),
        "123",
        "test123"
    )).toEqual({"id": 1});
});
