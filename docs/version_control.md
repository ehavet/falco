# Version Control

## Branching Strategy

We are working with one main branch called `master`.

For each new development a new branch needs to be created based on `master`.

Before creating your working branch, do not forget to retrieve the last changes from the remote master branch with `git pull`.

###### Best practices

 - Try to keep your branch lifetime as short as possible. Huge code reviews with a lot of different changes can be painful both for the author and the reviewer.
 When reaching 300 LoC changed and not finished yet, start asking yourself if you could/should split the ticket you are working on. 
 If not possible, another solution could be to create a first merge request with the code you have created that can be integrated, and then do a second one later on with the rest of the code.
 Do not hesitate to contact a team member to discuss it.

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

###### Best practices

 - Think about doing synchronous code reviews : after a colleague has submitted some comments, a face to face conversation can help better understanding some remarks made and solving them quickly instead of countless back and forth

## Commit

Each commit must have at least a message describing succinctly what work has been done.

Examples : `feat: save policy into database`, `feat: get quote returns 404 if quote is not found`, `fix: certificate generation error`

Do not hesitate to add more details if necessary by skipping a line after the commit main message and entering the additional description you want.
Example:
```bash
fix: certificate generation error

The generated certificate once opened in Adobe Reader had some encoding issues.
By changing the buffer type from `utf8` to `binary`, it solved the error.
```

###### Best practices

 - Atomic commits : doing small commits focused on consistent small parts of code can help developers in their daily development by enhancing organization, understanding or reviewing compared to big commits with many different changes
 - Following the [Conventional Commit Convention](https://www.conventionalcommits.org/) is a way to improve the commit messages readability ang global codebase understanding
