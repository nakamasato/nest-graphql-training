# Step by Step

## [1. Getting Started](https://docs.nestjs.com/cli/overview#installation)

https://docs.nestjs.com/first-steps

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

1. Check http://localhost:3000/

    ```
    Hello World!
    ```

## 2. Basics

### [2.1. Controllers](https://docs.nestjs.com/controllers)

![](https://docs.nestjs.com/assets/Controllers_1.png)

A controller's purpose is to receive specific requests for the application. The routing mechanism controls which controller receives which requests.

Example: `GET /cats` will be handled by the controller.

1. Create `cat/cat.controller.ts`.

    ```ts
    import { Controller, Get } from '@nestjs/common';

    @Controller('cats')
    export class CatsController {
      @Get()
      findAll(): string {
        return 'This action returns all cats';
      }
    }
    ```

    ※ The response's status code is **always 200 by default**, except for POST requests which use 201

1. Import the new controller in `app.module.ts`.

    ```ts
    import { Module } from '@nestjs/common';
    import { CatsController } from './cats/cats.controller';

    @Module({
      controllers: [CatsController],
    })
    export class AppModule {}
    ```

### [2.2 Provider](https://docs.nestjs.com/providers)

![](https://docs.nestjs.com/assets/Components_1.png)

Many of the basic Nest classes may be treated as a provider – services, repositories, factories, helpers, and so on. The main idea of a provider is that it can be **injected** as a dependency.

1. Create **Service**

    `CatService`: This service will be responsible for data storage and retrieval, and is designed to be used by the CatsController

    You can create service with cli: `nest g service cats`:

    ```ts
    import { Injectable } from '@nestjs/common';
    import { Cat } from './interfaces/cat.interface';

    @Injectable()
    export class CatsService {
      private readonly cats: Cat[] = [];

      create(cat: Cat) {
        this.cats.push(cat);
      }

      findAll(): Cat[] {
        return this.cats;
      }
    }
    ```

    ```ts
    export interface Cat {
      name: string;
      age: number;
      breed: string;
    }
    ```

1. Use the service in `CatController`.

    ```ts
    import { Controller, Get, Post, Body } from '@nestjs/common';
    import { CreateCatDto } from './dto/create-cat.dto';
    import { CatsService } from './cats.service';
    import { Cat } from './interfaces/cat.interface';

    @Controller('cats')
    export class CatsController {
      constructor(private catsService: CatsService) {}

      @Post()
      async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
      }

      @Get()
      async findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
      }
    }
    ```

    `constructor(private catsService: CatsService) {}` CatsService is injected through the class constructor.

1. Provider registeration.

    Now that we have defined a provider (`CatsService`), and we have a consumer of that service (`CatsController`), we need to register the service with Nest so that it can perform the injection. We do this by editing our module file (`app.module.ts`) and adding the service to the providers array of the `@Module()` decorator.

    ```ts
    import { Module } from '@nestjs/common';
    import { CatsController } from './cats/cats.controller';
    import { CatsService } from './cats/cats.service';

    @Module({
      controllers: [CatsController],
      providers: [CatsService],
    })
    export class AppModule {}
    ```

### [2.3. Modules](https://docs.nestjs.com/modules)

![](https://docs.nestjs.com/assets/Modules_1.png)

A module is a class annotated with a @Module() decorator. The @Module() decorator provides metadata that Nest makes use of to organize the application structure.

```ts
@Module({
  controllers: [],
  providers: [], // service
  imports: [], // imported modules required in this module
  exports: [], // the subset of providers that are provided by this module and should be available in other modules
})
```

**Feature module**

The CatsController and CatsService belong to the same application domain. As they are closely related, it makes sense to move them into a feature module.

`cats/cats.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```
`app.module.ts`:
```ts
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

### [2.3. Middleware](https://docs.nestjs.com/middleware)

![](https://docs.nestjs.com/assets/Middlewares_1.png)

## [3. GraphQL with apollo and express](https://docs.nestjs.com/graphql/quick-start)

https://notiz.dev/blog/graphql-code-first-with-nestjs-7

### 3.1. install graphql and apollo-server-express

```
npm i --save @nestjs/graphql @nestjs/apollo graphql-tools graphql
npm i --save apollo-server-express
```

### 3.2. Hello World

1. Add `src/hello.resolver.ts`

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

1. Add the resolver to `app.module.ts`

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

1. Open http://localhost:3000/graphql and write

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

### 3.3. Update module

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


### 3.4. Add GraphQL types

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

### 3.5 GraphQL resolver

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

### 3.6. ORM ([prisma](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/install-prisma-client-typescript-postgres))

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

## 3.7. Run

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

## 3.8. Add `mutation` to UserService (CreateUser).

1. Add `createUser` to `src/user/user.resolver.ts`.

    Use userService to manipulate user.

    ```ts
    import { UserService } from './user.service';
    ...
    @Mutation(returns => User)
    async createUser(
        @Args('name', { nullable: false }) name: string,
        @Args('email', { nullable: false }) email: string,
        @Args('password', { nullable: false }) password: string) {
        return this.userService.createUser({
            name: name,
            createdAt: new Date(),
            updatedAt: new Date(),
            email: email,
            password: password
        });
    }
    ```

1. Update query and reolve field too.

    - Add `HobbyService` in constructor.
    - Remove `PrismaService` from constructor.
    - Use userService and hobbyService instead of directly calling PrismaService.

    ```ts
    constructor(
        private userService: UserService,
        private hobbyService: HobbyService,
    ) { }

    @Query(returns => [User])
    async users() {
        return this.userService.users({});
    }

    @ResolveField()
    async hobbies(@Parent() user: User) {
        return this.hobbyService.Hobbys({ where: { userId: user.id } })
    }
    ```

1. Update `app.modules.ts`.

    ```ts
    import { HobbyService } from './hobby/hobby.service';
    import { UserService } from './user/user.service';
    providers: [UserResolver, HobbyResolver, HelloResolver, PrismaService, UserService, HobbyService]
    ```

1. Run `npm run start:dev`

    `schema.gql` is updated (code first).

    ```
    type Mutation {
      createUser(name: String!, email: String!, password: String!): User!
    }
    ```
1. Check on localhost:3000/graphql

    1. Create a user

        ```
        mutation test {
          createUser(name: "naka", email: "test@email.com", password: "password") {registeredAt, id, name}
        }
        ```

        ```
        mutation test {
          createUser(name: "tanaka", email: "tanaka@email.com", password: "password") {registeredAt, id, name}
        }
        ```

    1. Get all users.

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

        ```
        {
          "data": {
            "users": [
              {
                "id": 1,
                "registeredAt": "2022-07-19T11:39:12.908Z",
                "updatedAt": "2022-07-19T11:39:12.908Z",
                "email": "test@email.com",
                "name": "naka",
                "hobbies": [
                  {
                    "id": 1,
                    "name": "naka"
                  }
                ]
              },
              {
                "id": 3,
                "registeredAt": "2022-07-19T11:49:16.324Z",
                "updatedAt": "2022-07-19T11:49:16.324Z",
                "email": "tanaka@email.com",
                "name": "tanaka",
                "hobbies": [
                  {
                    "id": 3,
                    "name": "tanaka"
                  }
                ]
              }
            ]
          }
        }
        ```

## 3.9. Enable to register and check hobbies

1. Add `hobbies` to `src/hobby/hobby.resolver.ts`.

    ```ts
    @Resolver()
    export class HobbyResolver {
        constructor(
            private hobbyService: HobbyService
        ) { }
        @Query(returns => [Hobby])
        async hobbies() {
            return this.hobbyService.Hobbys({});
        }
    }
    ```

1. Check hobbies query.

    ```
    query hobby {
      hobbies {
        id,
        name
      }
    }
    ```

    ```
    {
      "data": {
        "hobbies": []
      }
    }
    ```

    schema.gql:

    ```diff
     type Query {
       users: [User!]!
    +  hobbies: [Hobby!]!
       hello: String!
     }
    ```

1. Update prisma/schema.prisma

    ```diff
     model Hobby {
    -  id     Int    @id
    +  id     Int    @id @default(autoincrement())
       name   String
       User   User?  @relation(fields: [userId], references: [id])
       userId Int?
    ```

1. Apply the schema change.

    ```
    npx prisma migrate dev --name init
    Need to install the following packages:
      prisma
    Ok to proceed? (y) y
    Environment variables loaded from .env
    Prisma schema loaded from prisma/schema.prisma
    Datasource "db": PostgreSQL database "postgres", schema "public" at "localhost:5432"

    Applying migration `20220719122939_init`

    The following migration(s) have been created and applied from new schema changes:

    migrations/
      └─ 20220719122939_init/
        └─ migration.sql

    Your database is now in sync with your schema.

    ✔ Generated Prisma Client (4.0.0 | library) to ./node_modules/@prisma/client in 54ms
    ```

1. Enable to register hobbies when creating user.

    ```ts
    @Mutation(returns => User)
    async createUser(
        @Args('name', { nullable: false }) name: string,
        @Args('email', { nullable: false }) email: string,
        @Args('password', { nullable: false }) password: string,
        @Args('hobby', { nullable: true }) hobby: string) {
        return this.userService.createUser({
            name: name,
            createdAt: new Date(),
            updatedAt: new Date(),
            email: email,
            password: password,
            hobbies: {
                create: {
                    name: hobby,
                }
            }
        });
    ```

1. Check http://localhost:3000/graphql

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

    Check hobbies

    ```
    query hobby {
      hobbies {
        id,
        name,
      }
    }
    ```

    ```
    {
      "data": {
        "hobbies": [
          {
            "id": 1,
            "name": "programming"
          }
        ]
      }
    }
    ```

    all users:

    ```json
    {
      "data": {
        "users": [
          {
            "id": 1,
            "registeredAt": "2022-07-19T11:39:12.908Z",
            "updatedAt": "2022-07-19T11:39:12.908Z",
            "email": "test@email.com",
            "name": "naka",
            "hobbies": []
          },
          {
            "id": 3,
            "registeredAt": "2022-07-19T11:49:16.324Z",
            "updatedAt": "2022-07-19T11:49:16.324Z",
            "email": "tanaka@email.com",
            "name": "tanaka",
            "hobbies": []
          },
          {
            "id": 4,
            "registeredAt": "2022-07-19T12:33:27.220Z",
            "updatedAt": "2022-07-19T12:33:27.220Z",
            "email": "john@email.com",
            "name": "john",
            "hobbies": [
              {
                "id": 1,
                "name": "programming"
              }
            ]
          }
        ]
      }
    }
    ```


# References
- https://notiz.dev/blog/graphql-code-first-with-nestjs-7
- https://www.prisma.io/docs/concepts/components/prisma-schema
- [How to create your first NestJS GraphQL Application?](https://progressivecoder.com/how-to-create-your-first-nestjs-graphql-application/)
- [nestjs graphql](https://docs.nestjs.com/graphql/quick-start)
- [nestjs prisma](https://docs.nestjs.com/recipes/prisma)
- [nestjs providers](https://docs.nestjs.com/providers)
