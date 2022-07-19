import { Test, TestingModule } from '@nestjs/testing';
import { HobbyService } from '../hobby/hobby.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, PrismaService, UserService, HobbyService],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
