import { Category } from 'generated/prisma';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { StreamModel } from '../../stream/models/stream.model';

@ObjectType()
export class CategoryModel implements Category {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public title: string;

  @Field(() => String)
  public thumbnailUrl: string;

  @Field(() => String)
  public slug: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field(() => [StreamModel], { nullable: true })
  public streams: StreamModel[];

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
