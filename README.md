# Nest GraphQL Training

## Description

- [Nest](https://github.com/nestjs/nest): Nest is a framework for building efficient, scalable Node.js server-side applications.
- [Express](https://expressjs.com/): a well-known minimalist web framework for node.
- [GraphQL](https://graphql.org/)
- [Apollo](https://www.apollographql.com/)
- [npm](https://www.npmjs.com/)

You can check how to start nest graphql training here: [step by step](step-by-step.md)

## Upgrade packages

https://www.npmjs.com/package/npm-check-updates

```
ncu
```

## Running the app

1. Install dependencies
    ```
    pnpm install
    ```

1. Start database.

    ```
    docker-compose up -d
    ```

    or use local postgresql

    ```sql
    psql postgres
    CREATE USER nest_graphql_training WITH PASSWORD 'nest_graphql_training';
    ALTER USER nest_graphql_training CREATEDB;
    ALTER DATABASE nest_graphql_training OWNER TO nest_graphql_training;
    ```

1. Prepare schema
    ```
    npx prisma migrate dev --name init
    ```
1. Run the app.

    ```bash
    # development
    $ pnpm run start

    # watch mode
    $ pnpm run start:dev

    # production mode
    $ pnpm run start:prod
    ```
1. Send `mutation` request from http://localhost:3000/graphql

    ```
    mutation test {
      createUser(
        name: "john",
        email: "john@email.com",
        password: "password",
        hobby: "programming"
      ) {
        registeredAt,
        id,
        name,
        hobbies {
          id,
          name
        }
      }
    }
    ```
    or via curl

    ```
    curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"mutation test {\n  createUser(\n    name: \"bob\",\n    email: \"bob@email.com\",\n    password: \"password\",\n    hobby: \"cooking\"\n  ) {\n    registeredAt,\n    id,\n    name,\n    hobbies {\n      id,\n      name\n    }\n  }\n}"}' --compressed
    {"data":{"createUser":{"registeredAt":"2023-03-18T23:35:57.467Z","id":4,"name":"bob","hobbies":[{"id":2,"name":"cooking"}]}}}
    ```

1. `Query` request from http://localhost:3000/graphql

    ```
    query hobby {
      hobbies {
        id,
        name,
      }
    }
    ```

    You can send via curl:
    ```
    curl 'http://localhost:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query hobby {\n  hobbies {\n    id,\n    name,\n  }\n}"}' --compressed
    {"data":{"hobbies":[{"id":1,"name":"programming"}]}}
    ```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
