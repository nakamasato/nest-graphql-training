import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import process from 'process';

const traceExporter =
  process.env['NODE_ENV'] == 'production'
    ? new TraceExporter()
    : new ConsoleSpanExporter();

const sampler =
  process.env['NODE_ENV'] == 'production'
    ? new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(0.1),
      })
    : new AlwaysOnSampler();

export const otelSDK = new NodeSDK({
  traceExporter: traceExporter,
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator()],
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    new PrismaInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new GraphQLInstrumentation({ depth: 3, mergeItems: true }),
    new PgInstrumentation({
      requireParentSpan: true,
      addSqlCommenterCommentToQueries: true,
    }),
  ],
  sampler: sampler,
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
