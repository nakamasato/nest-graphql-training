import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('AllUsers', () => {
    return request
      .default(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'AllUsers',
        query: 'query AllUsers {\n  users {\n    id\n  }\n}\n',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.users).toBeDefined();
        expect(res.body.data.users.length).toBe(0);
      });
  });
});
