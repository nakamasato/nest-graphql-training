# [Observability - Tracing](https://github.com/nakamasato/nest-graphql-training/pull/426)

## Tracing for nestjs

1. Install dependencies
    ```
    npm i nestjs-otel @opentelemetry/sdk-node --save
    # npm install --save @opentelemetry/sdk-trace-node
    # npm install --save @opentelemetry/sdk-trace-base
    npm install --save @google-cloud/opentelemetry-cloud-trace-exporter
    npm install --save @opentelemetry/auto-instrumentations-node
    ```
1. Create `tracing.ts`

1. Create Cloud SQL (https://zenn.dev/razokulover/articles/f8dd01db6c1e95)

    ```
    PROJECT_ID=your-project-id
    REGION=asia-northeast1
    gcloud auth login
    DB_ROOT_PASSWORD=$(openssl rand -base64 32)
    DB_USER_PASSWORD=$(openssl rand -base64 32)
    gcloud sql instances create test-db \
        --database-version=POSTGRES_15 \
        --tier db-f1-micro \
        --region $REGION \
        --root-password=${DB_ROOT_PASSWORD} \
        --project $PROJECT
    ```

1. Create a database and user

    ```
    gcloud sql users set-password postgres \
        --instance=test-db \
        --password=$DB_USER_PASSWORD \
        --project $PROJECT
    ```

1. Deploy Cloud Run

    ```
    gcloud run deploy nestjs-graphql-training \
        --source . \
        --project $PROJECT \
        --platform=managed \
        --region $REGION \
        --allow-unauthenticated \
        --add-cloudsql-instances ${PROJECT}:${REGION}:test-db \
        --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_USER_PASSWORD}@localhost:5432/postgres?host=/cloudsql/${PROJECT}:${REGION}:test-db" \
        --set-env-vars="ENVIRONMENT=production"
    ```

    ```
    gcloud run deploy nestjs-graphql-training --image [image] --project $PROJECT
    ```

1. Test

    ```
    URL=$(gcloud run services describe nestjs-graphql-training --project $PROJECT --region $REGION --format json | jq -r .status.url)
    ```

    Mutation

    ```
    curl -X POST $URL/graphql -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"mutation test {\n  createUser(\n    name: \"bob\",\n    email: \"bob@email.com\",\n    password: \"password\",\n    hobby: \"cooking\"\n  ) {\n    registeredAt,\n    id,\n    name,\n    hobbies {\n      id,\n      name\n    }\n  }\n}"}' --compressed
    ```
    ```
    {"data":{"createUser":{"registeredAt":"2024-02-25T12:04:36.447Z","id":3,"name":"bob","hobbies":[{"id":2,"name":"cooking"}]}}}
    ```

    Query

    ```
    curl -X POST $URL/graphql -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:3000' --data-binary '{"query":"query hobby {\n  hobbies {\n    id,\n    name,\n  }\n}"}' --compressed
    ```
    ```
    {"data":{"hobbies":[{"id":1,"name":"programming"},{"id":2,"name":"cooking"}]}}
    ```

1. Check on https://console.cloud.google.com/traces/list

    ![](gcp-cloud-trace.png)

1. Clean up

    ```
    gcloud run services delete nestjs-graphql-training --project $PROJECT --region ${REGION}
    gcloud sql instances delete test-db --project $PROJECT
    ```

## Tracing for prisma

> [!NOTE]
> https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/opentelemetry-tracing

1. Add

    ```
    generator client {
      provider        = "prisma-client-js"
      previewFeatures = ["tracing"]
    }
    ```

1. Install

    ```
    npm install @opentelemetry/semantic-conventions @opentelemetry/exporter-trace-otlp-http @opentelemetry/instrumentation @opentelemetry/sdk-trace-base @opentelemetry/sdk-trace-node @opentelemetry/resources
    ```

## Ref

- Deploy nestjs to cloud run:
    - https://zenn.dev/razokulover/articles/f8dd01db6c1e95
    - https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service
- trace:
    - https://www.tomray.dev/nestjs-open-telemetry
    - https://zenn.dev/monicle/articles/682d406e69b5ba
    - https://github.com/pragmaticivan/nestjs-otel
    - https://speakerdeck.com/iinm/monitoring-graphql-api-on-cloud-run
    - https://cloud.google.com/trace/docs/setup/nodejs-ot
