# Branching Strategy

We are working with one main branch called `master`.

For each new development a new branch needs to be created based on `master`.

Before creating your working branch, do not forget to retrieve the last changes from the remote master branch with `git pull`.

Try to keep your branch lifetime as short as possible.

## Naming conventions

### Branches

The naming of the branches needs to follow a specific convention :

`<prefix>/<ticket_id>-<branch-description>`

Depending on the work you are currently doing like developing a new feature or fixing a bug, you need to add the right prefix.

prefix : `feature`, `bugfix`, `tech`, `doc`

Examples : `feature/55-get-quote-repository`, `feature/55-get-quote-usecase`, `tech/32-install-yarn`


## Merge Requests

When creating a merge request, the name must follow the following convention : 

`[<PREFIX>] <Description>`

PREFIX : `FEATURE`, `BUGFIX`, `TECH`, `DOC`

Example: `[FEATURE] Retrieve a quote from its id`

An additional description can be added if necessary.

## Commit

A good practice is to do small commits that work.
Each commit must have at least a message describing succinctly what work has been done.

Examples : `Save policy into database`, `Get quote returns 404 if quote is not found`, `Fix certificate generation error`

Do not hesitate to add more details if necessary, by skipping a line after the commit main message and entering the text you want.

Example:
```bash
Fix certificate generation error

The generated certificate once opened in Adobe Reader had some encoding issues.
By changing the buffer type from `utf8` to `binary`, it solved the error.
```
