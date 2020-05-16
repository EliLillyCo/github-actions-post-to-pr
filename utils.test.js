const fs = require('fs');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const utils = require('./utils');
const process = require('process');
const octokitFixtures = require("@octokit/fixtures");
const github = require('@actions/github');

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

test('format markdown block', async() => {
    expect(utils.formatMarkdownBlock("test")).toEqual("```\ntest\n```\n")
});


test('apply message modifier', async() => {
    expect(utils.applyMessageModifier("test\ntest2", "grep test2")).toEqual("test2\n")
});


test('get workflow run', async() => {
    process.env.GITHUB_REPOSITORY = "test/test"
    process.env.GITHUB_RUN_ID = "123"
    octokitFixtures.nock("https://api.github.com")
    .get("/repos/test/test/actions/runs/123")
    .reply(200, {
        "workflow_id": 772800
    });
    expect((await utils.getRun(new github.GitHub("123")))).toEqual(
        {
            "workflow_id": 772800
        }
    );
});


test('upload artifact', async() => {

    process.env.ACTIONS_RUNTIME_TOKEN = "12334"
    process.env.ACTIONS_RUNTIME_URL = "https://api.github.com/testupload"

    octokitFixtures.nock("https://api.github.com")
    .post(/testupload.*/)
    .reply(200,     {
        "id": 1
    });



    let error;
    try {
        await utils.uploadArtifacts(
            [
                {
                    "message_file": testLogFile,
                    "title": "Header",
                    "artifact_name": "defaults to title",
                    "modifier": "grep 'test'",
                    "compare_branches": ["master"]
                },
                {
                    "message_file": testLogFile,
                    "title": "Header2",
                    "artifact_name": "defaults to title2",
                    "modifier": "grep 'test'",
                    "compare_branches": ["master"]
                }
            ]
        )
    } catch (e) {
    error = e;
    }
    expect(error.message).toEqual("No URL provided by the Artifact Service to upload an artifact to");
});