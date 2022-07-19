import { Query, Resolver } from '@nestjs/graphql';
import { Hobby } from '../models/hobby.model';
import { HobbyService } from './hobby.service';

@Resolver()
export class HobbyResolver {
  constructor(private hobbyService: HobbyService) {}
  @Query(() => [Hobby])
  async hobbies() {
    return this.hobbyService.Hobbys({});
  }
}
