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

test('format markdown block collapsible', async() => {
    expect(utils.formatMarkdownBlock("test", true)).toEqual(
        "<details><summary>Expand</summary>\n<br>\n\n```\ntest\n```\n</details>\n"
        )
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
