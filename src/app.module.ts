import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HelloResolver } from './hello.resolver';
import { HobbyResolver } from './hobby/hobby.resolver';
import { PrismaService } from './prisma/prisma.service';
import { UserResolver } from './user/user.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true
    }),
  ],
  providers: [UserResolver, HobbyResolver, HelloResolver, PrismaService]
})
export class AppModule { }
