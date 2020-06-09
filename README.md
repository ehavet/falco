# falco-api

[![pipeline status](https://gitlab.com/appenin/falco-api/badges/init_api/pipeline.svg)](https://gitlab.com/appenin/falco-api/-/commits/init_api)
[![coverage report](https://gitlab.com/appenin/falco-api/badges/init_api/coverage.svg)](https://gitlab.com/appenin/falco-api/-/commits/init_api)

## Prerequisites

Before starting to work on the API, you will first need to install the following :

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (see [package.json](/package.json) "engine.node" field for the version to use, and we advise to manage NodeJS versions locally with [n](https://github.com/tj/n))
* [Docker](https://docs.docker.com/get-docker/)

And make sure that :

* You have been granted an access to the [Appenin falco-api gitlab repository](https://gitlab.com/appenin/falco-api)  
* You have [added your ssh key to gitlab](https://docs.gitlab.com/ee/ssh/)

## Installation

```bash
git clone git@gitlab.com:appenin/falco-api.git
cd falco-api
npm ci
```

## Usage

### Server

For the API to work properly, you need to have a database running. You can run one locally in Docker with the following command :

```bash
npm run containers:db:start
```

Then, you can launch the API :

```bash
npm start
```

Or

```
npm run dev
```

to start with watch mode. This can be convenient in development mode to avoid restarting manually the server after each modification in the code.

The API can be accessed at [http://localhost:8080](http://localhost:8080)

For the API documentation, go to [http://localhost:8080/documentation](http://localhost:8080/documentation)


If you already have launched the database locally and need to apply newly created migrations, run :

```bash
npm run db:migrate
```

Or 

```bash
npm run db:undo
```

if you need to revert the last migration

### Tests

The automated tests can be launched with the command :

```bash
npm test
```

This will run all the automated tests and generate the appropriate coverage report.

Ah, by the way, you need to have the database running locally before launching the automated tests !
