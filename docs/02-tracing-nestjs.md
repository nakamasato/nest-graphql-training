# [Observability - Tracing](https://github.com/nakamasato/nest-graphql-training/pull/426)

## Tracing for nestjs

1. Install dependencies
    ```
    pnpm i --save @opentelemetry/sdk-trace-base @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @google-cloud/opentelemetry-cloud-trace-exporter @opentelemetry/core
    ```
1. Create `tracing.ts`

    ```ts
    import {
      CompositePropagator,
      W3CTraceContextPropagator,
    } from '@opentelemetry/core';
    import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
    import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
    import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
    import { NodeSDK } from '@opentelemetry/sdk-node';
    import process from 'process';

    const traceExporter =
      process.env['NODE_ENV'] == 'production'
        ? new TraceExporter()
        : new ConsoleSpanExporter();

    export const otelSDK = new NodeSDK({
      traceExporter: traceExporter,
      textMapPropagator: new CompositePropagator({
        propagators: [new W3CTraceContextPropagator()],
      }),
      spanProcessor: new BatchSpanProcessor(traceExporter),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    export default otelSDK;

    // You can also use the shutdown method to gracefully shut down the SDK before process shutdown
    // or on some operating system signal.
    process.on('SIGTERM', () => {
      otelSDK
        .shutdown()
        .then(
          () => console.log('SDK shut down successfully'),
          (err) => console.log('Error shutting down SDK', err),
        )
        .finally(() => process.exit(0));
    });
    ```

    1. [W3C context propagation](https://www.w3.org/TR/trace-context/)
    1. [opentelemetry core](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-core/README.md)
        1. W3CTraceContextPropagator
        1. CompositePropagator
        1. [Baggage Propagation](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/baggage/api.md#baggage-propagation)

1. Update `main.ts`

    ```ts
    // Make sure to import the SDK before any other modules
    // eslint-disable-next-line import/order
    import otelSDK from './tracing';
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';

    async function bootstrap() {
      // Start SDK before nestjs factory create
      await otelSDK.start();
      const app = await NestFactory.create(AppModule);
      await app.listen(3000);
    }
    bootstrap();
    ```

1. Create Cloud SQL (https://zenn.dev/razokulover/articles/f8dd01db6c1e95)

    ```
    PROJECT=your-project-id
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
        --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_USER_PASSWORD}@localhost:5432/postgres?host=/cloudsql/${PROJECT}:${REGION}:test-db"
    ```

    This command builds an image with `NODE_ENV=production` by default.

    ```
    gcloud run deploy nestjs-graphql-training \
        --image ${REGION}-docker.pkg.dev/${PROJECT}/cloud-run-source-deploy/nestjs-graphql-training \
        --add-cloudsql-instances ${PROJECT}:${REGION}:test-db \
        --set-env-vars="DATABASE_URL=postgresql://postgres:${DB_USER_PASSWORD}@localhost:5432/postgres?host=/cloudsql/${PROJECT}:${REGION}:test-db" \
        --project $PROJECT \
        --region $REGION
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

## FAQ

1. How to trace only for sampled requests by Cloud Run?
    1. [Cloud Trace - Trace Context](https://cloud.google.com/trace/docs/trace-context#context-propagation-protocols)
    1. [Cloud Trace - Trace Sampling](https://cloud.google.com/trace/docs/trace-sampling)
    1. [W3C](https://www.w3.org/TR/trace-context/#traceparent-header)
