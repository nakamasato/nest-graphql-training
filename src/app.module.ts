import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HelloResolver } from './hello.resolver';
import { HobbyResolver } from './hobby/hobby.resolver';
import { HobbyService } from './hobby/hobby.service';
import { PrismaService } from './prisma/prisma.service';
import { UserResolver } from './user/user.resolver';
import { UserService } from './user/user.service';
import { OpenTelemetryModule } from 'nestjs-otel';

const OpenTelemetryModuleConfig = OpenTelemetryModule.forRoot({
  metrics: {
    hostMetrics: true, // Includes Host Metrics
    apiMetrics: {
      enable: true, // Includes api metrics
      defaultAttributes: {
        // You can set default labels for api metrics
        custom: 'label',
      },
      ignoreRoutes: ['/favicon.ico'], // You can ignore specific routes (See https://docs.nestjs.com/middleware#excluding-routes for options)
      ignoreUndefinedRoutes: false, //Records metrics for all URLs, even undefined ones
    },
  },
});
@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true,
    }),
    OpenTelemetryModuleConfig,
  ],
  providers: [
    UserResolver,
    HobbyResolver,
    HelloResolver,
    PrismaService,
    UserService,
    HobbyService,
  ],
})
export class AppModule {}
