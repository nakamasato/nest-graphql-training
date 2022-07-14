# Step by Step

## [1. Getting Started](https://docs.nestjs.com/cli/overview#installation)

1. Install `nest`

    ```
    npm install -g @nestjs/cli
    ```

1. Create a project

    ```
    nest new nest-graphql-training
    cd nest-graphql-training
    ```

    files:
    - `app.controller.ts`: a basic controller with single route.
    - `app.controller.spec.ts`: The unit tests for the controller
    - `app.module.ts`: The root module of the application.
    - `app.service.ts`: A basic service with a single method.
    - `main.ts`: The entry file of the application which uses the core function NestFactory to create a Nest application instance.

1. Run a app

    ```
    npm run start:dev
    ```

## [2. GraphQL with apollo and express](https://docs.nestjs.com/graphql/quick-start)

### 2.1. install graphql and apollo-server-express

```
npm i --save @nestjs/graphql @nestjs/apollo graphql-tools graphql
npm i --save apollo-server-express
```

### 2.2. Update module

Update `src/app.module.ts` with the following codes:

```ts
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HobbyResolver } from './hobby/hobby.resolver';
import { UserResolver } from './user/user.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true
    })
  ],
  providers: [UserResolver, HobbyResolver]
})
export class AppModule { }

```

- `autoSchemaFile`: code first approach to use TypeScript classes and decorators to generate the GraphQL schema.
- `playground`: API doc at http://localhost:3000/graphql
- `debug`:

`@nestjs/graphql` provides all decorators to generate our schema:
- @ObjectType()
- @Field()
- @InputType()
- @Args
- @Query()
- @Mutation()
- @ResolveField


### 2.3. Add GraphQL types

`models/user.model.ts`:

```ts
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Hobby } from '../../hobby/models/hobby.model';

@ObjectType()
export class User {
    @Field(type => Int)
    id: number;

    @Field(type => Date, { name: 'registeredAt' })
    createdAt: Date;

    @Field(type => Date)
    updatedAt: Date;

    @Field(type => String)
    email: string;

    password: string;

    @Field(type => String, { nullable: true })
    name?: string;

    @Field(type => [Hobby])
    hobbies: Hobby[];
}
```

`models/hobby.model.ts`:

```ts
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Hobby {
    @Field(type => Int)
    id: number;

    @Field(type => String)
    name: string;
}
```

### 2.4 GraphQL resolver

Use nest CLI to generate resolvers for `User` and `Hobby`.

```
nest g r user
nest g r hobby
```

`user/user.resolver.ts`:

```ts
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(of => User)
export class UserResolver {
    constructor(private prisma: PrismaService) { }

    @Query(returns => [User])
    async users() {
        return this.prisma.user.findMany();
    }

    @ResolveField()
    async hobbies(@Parent() user: User) {
        return this.prisma.hobby.findMany({
            where: { User: { id: user.id } }
        });
    }
}
```

### 2.5. ORM ([prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/install-prisma-client-typescript-postgres))

```
npm install @prisma/client
```

add `tsconfig.json`:

```json
    "strict": true,
    "lib": [
      "esnext"
    ],
    "esModuleInterop": true,
```

```
npx prisma
npx prisma init
```

write prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime
  updatedAt DateTime
  email     String   @unique
  password  String
  name      String
  hobbies   Hobby[]
}

model Hobby {
  id     Int    @id
  name   String
  User   User?  @relation(fields: [userId], references: [id])
  userId Int?
}
```

Set `DATABASE_URL` in `.env`.

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
```

Run postgres

```
docker-compose up -d
```

Migrate (schema is applied to the db)

```
npx prisma migrate dev --name init
```

There's `migrations` directory in `prisma`

```
tree prisma
prisma
├── migrations
│   ├── 20220715114431_init
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma

2 directories, 3 files
```

If you rerun the command, you'll see `Already in sync, no schema change or pending migration was found.`

You can check the created tables in postgres.

```
docker-compose exec -T postgres psql -U postgres postgres -c '\dt'
               List of relations
 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
 public | Hobby              | table | postgres
 public | User               | table | postgres
 public | _prisma_migrations | table | postgres
(3 rows)
```

add `prisma/prisma.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
```

add `prisma/prisma.service.spec.ts`

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
```

Add `PrismaService` to `app.module.ts`

```ts
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import { HobbyResolver } from './hobby/hobby.resolver';
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
  providers: [UserResolver, HobbyResolver, PrismaService]
})
export class AppModule { }
```

## Run

```
npm run start:dev
```

# References
- https://notiz.dev/blog/graphql-code-first-with-nestjs-7
- https://www.prisma.io/docs/concepts/components/prisma-schema
- [How to create your first NestJS GraphQL Application?](https://progressivecoder.com/how-to-create-your-first-nestjs-graphql-application/)
- [nstjs graphql](https://docs.nestjs.com/graphql/quick-start)
- [nestjs prisma](https://docs.nestjs.com/recipes/prisma)
- [nestjs providers](https://docs.nestjs.com/providers)
