# Github Actions Post to Pull Request

This github actions allows easy posting of formatted build results into GitHub PRs.

## Setup
Durring the github action build, create a build output text file.

```
your build command | tee output.txt
```

Inlcude the Post to PR github action step.

```
    - name: "Post to PR"
      uses: EliLillyCo/github-actions-post-to-pr@main
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        post_to_pr_definition: |
          [
            {
              "message_file": "./output.txt",
              "title": "My Test Execution"
            }
          ]
```


This will create a pull request comment such as the one below.

Additional optional arguments are available to customize the pull request output
```
[
  {
    "message_file": "./output.txt",
    "title": "My Test Execution",
    "artifact_name": "defaults to title", // OPTIONAL: Defaults to title stripped of non-alphanumeric characters/spaces
    "modifier": "grep 'onlytheselines'", // OPTIONAL: Shell command which will be executed against the output file.  This can be used to prevent long pull request messages.
    "collapsible": true // OPTIONAL: true/false, set to true to make PR message collapse for long messages, defaults to False
  }
]
```



# --- Example Pull Request Comment ---

# Unit Test

## This change:

```

> post-to-pr@0.0.1 test /home/runner/work/github-actions-post-to-pr/github-actions-post-to-pr
> eslint *.js && jest --collect-coverage

-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |    94.94 |    86.36 |    90.91 |    94.94 |                   |
 pull_request.js |    96.36 |       85 |      100 |    96.36 |             21,40 |
 utils.js        |    91.67 |      100 |    83.33 |    91.67 |             42,44 |
-----------------|----------|----------|----------|----------|-------------------|

```

# Contributing

Pull requests & issues welcome!

## Dev Setup

## Setup Dependencies
```
npm install
```

## Running tests
```
npm test
```

## Packaging (required before creating PR)

```
npm run package
```
