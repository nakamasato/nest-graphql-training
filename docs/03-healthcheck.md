# [HealthCheck](https://docs.nestjs.com/recipes/terminus)

## Basics

1. install terminus

    ```
    pnpm install --save @nestjs/terminus
    ```

1. Create module

    ```
    nest g module health
    ```

1. Create controller

    ```
    nest g controller health
    ```

    ```ts
    import { Controller, Get } from '@nestjs/common';
    import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

    @Controller('health')
    export class HealthController {
        constructor(private health: HealthCheckService) {}

        @Get()
        @HealthCheck()
        check() {
            return this.health.check([]);
        }
    }
    ```

1. Check

    ```
    curl localhost:3000/health
    {"status":"ok","info":{},"error":{},"details":{}}%
    ```

## [Prisma Healthcheck](https://github.com/nestjs/terminus/tree/46f675c4e2dc03dc899d7e70e9940669345b207c/sample/012-prisma-app)


1. Create prisma module

    ```ts
    import { Module } from '@nestjs/common';
    import { PrismaService } from './prisma.service';

    @Module({
      providers: [PrismaService],
      exports: [PrismaService],
    })
    export class PrismaModule {}
    ```
1. Import `PrismaModule` in `health.module.ts`

    ```ts
    import { Module } from '@nestjs/common';
    import { HealthController } from './health.controller';
    import { TerminusModule } from '@nestjs/terminus';
    import { PrismaModule } from 'src/prisma/prisma.module';

    @Module({
      imports: [TerminusModule, PrismaModule],
      controllers: [HealthController]
    })
    export class HealthModule {}
    ```

1. Update `health.controller.ts`

    ```ts
    import { Controller, Get } from '@nestjs/common';
    import {
        HealthCheck,
        HealthCheckService,
        PrismaHealthIndicator,
    } from '@nestjs/terminus';
    import { PrismaService } from 'src/prisma/prisma.service';

    @Controller('health')
    export class HealthController {
        constructor(
            private health: HealthCheckService,
            private prismaHealth: PrismaHealthIndicator,
            private prisma: PrismaService,
        ) { }

        @Get()
        @HealthCheck()
        check() {
            return this.health.check([
                async () => this.prismaHealth.pingCheck('prisma', this.prisma),
            ]);
        }
    }
    ```

1. Check

    ```
    curl localhost:3000/health
    {"status":"ok","info":{"prisma":{"status":"up"}},"error":{},"details":{"prisma":{"status":"up"}}}%
    ```
