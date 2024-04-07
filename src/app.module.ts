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
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true,
    }),
    HealthModule,
    PrismaModule,
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
