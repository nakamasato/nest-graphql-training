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
