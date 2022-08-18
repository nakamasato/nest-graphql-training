# Nest GraphQL Training

## Description

- [Nest](https://github.com/nestjs/nest): Nest is a framework for building efficient, scalable Node.js server-side applications.
- [Express](https://expressjs.com/): a well-known minimalist web framework for node.
- [GraphQL](https://graphql.org/)
- [Apollo](https://www.apollographql.com/)
- [npm](https://www.npmjs.com/)

You can check how to start nest graphql training here: [step by step](step-by-step.md)

## Installation

```bash
$ npm install
```

## Running the app

1. Start database.

    ```
    docker-compose up -d
    ```

1. Run the app.

    ```bash
    # development
    $ npm run start

    # watch mode
    $ npm run start:dev

    # production mode
    $ npm run start:prod
    ```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
