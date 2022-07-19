import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Hobby } from './hobby.model';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field(() => Date, { name: 'registeredAt' })
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  email: string;

  password: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [Hobby])
  hobbies: Hobby[];
}
