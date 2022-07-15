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

### 2.2. Hello World

Add `src/hello.resolver.ts`

```ts
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class HelloResolver {

    @Query(returns => String)
    async hello() {
        return "Hello, World"
    }
}
```

```ts
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HelloResolver } from './hello.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: true,
      playground: true
    }),

  ],
  providers: [HelloResolver]
})
export class AppModule { }
```

Open http://localhost:3000/graphql and write

```
{
  hello
}
```

You'll see

```
{
  "data": {
    "hello": "Hello, World"
  }
}
```

### 2.3. Update module

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


### 2.4. Add GraphQL types

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

### 2.5 GraphQL resolver

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

### 2.6. ORM ([prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/install-prisma-client-typescript-postgres))

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

Add `prisma/prisma.service.spec.ts`. For more details, you can read [Use Prisma Client in your NestJS services](https://docs.nestjs.com/recipes/prisma#use-prisma-client-in-your-nestjs-services)

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

Add `user/user.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async user(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        return this.prisma.user.update({
            data,
            where,
        });
    }

    async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({
            where,
        });
    }
}
```

Add `src/hobby/hobby.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { Hobby, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HobbyService {
    constructor(private prisma: PrismaService) { }

    async Hobby(
        HobbyWhereUniqueInput: Prisma.HobbyWhereUniqueInput,
    ): Promise<Hobby | null> {
        return this.prisma.hobby.findUnique({
            where: HobbyWhereUniqueInput,
        });
    }

    async Hobbys(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.HobbyWhereUniqueInput;
        where?: Prisma.HobbyWhereInput;
        orderBy?: Prisma.HobbyOrderByWithRelationInput;
    }): Promise<Hobby[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.hobby.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async createHobby(data: Prisma.HobbyCreateInput): Promise<Hobby> {
        return this.prisma.hobby.create({
            data,
        });
    }

    async updateHobby(params: {
        where: Prisma.HobbyWhereUniqueInput;
        data: Prisma.HobbyUpdateInput;
    }): Promise<Hobby> {
        const { data, where } = params;
        return this.prisma.hobby.update({
            data,
            where,
        });
    }

    async deleteHobby(where: Prisma.HobbyWhereUniqueInput): Promise<Hobby> {
        return this.prisma.hobby.delete({
            where,
        });
    }
}
```

> Your UserService and PostService currently wrap the CRUD queries that are available in Prisma Client. In a real world application, the service would also be the place to add business logic to your application. For example, you could have a method called updatePassword inside the UserService that would be responsible for updating the password of a user.

## 2.7. Run

1. Run

    ```
    npm run start:dev
    ```

1. Access playground.

    ```
    http://localhost:3000/graphql
    ```

1. Check query.

    ```
    query AllUsers {
      users {
        id
        registeredAt
        updatedAt
        email
        name
        hobbies {
          id
          name
        }
      }
    }
    ```


# References
- https://notiz.dev/blog/graphql-code-first-with-nestjs-7
- https://www.prisma.io/docs/concepts/components/prisma-schema
- [How to create your first NestJS GraphQL Application?](https://progressivecoder.com/how-to-create-your-first-nestjs-graphql-application/)
- [nstjs graphql](https://docs.nestjs.com/graphql/quick-start)
- [nestjs prisma](https://docs.nestjs.com/recipes/prisma)
- [nestjs providers](https://docs.nestjs.com/providers)
