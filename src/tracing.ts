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
