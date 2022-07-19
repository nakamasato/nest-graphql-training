import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HobbyResolver } from './hobby.resolver';
import { HobbyService } from './hobby.service';

describe('HobbyResolver', () => {
  let resolver: HobbyResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HobbyResolver, HobbyService, PrismaService],
    }).compile();

    resolver = module.get<HobbyResolver>(HobbyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
