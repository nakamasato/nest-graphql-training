import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Hobby {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}
