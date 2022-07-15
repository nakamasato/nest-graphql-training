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
