import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { HobbyService } from '../hobby/hobby.service';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Resolver(of => User)
export class UserResolver {
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
}
