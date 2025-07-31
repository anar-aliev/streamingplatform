import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Stream } from 'generated/prisma';
import { UserModel } from 'src/modules/auth/account/models/user.model';
import { CategoryModel } from 'src/modules/category/model/category.model';

@ObjectType()
export class StreamModel implements Stream {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public title: string;

  @Field(() => String, { nullable: true })
  public thumbnailUrl: string;

  @Field(() => String, { nullable: true })
  public ingressId: string;

  @Field(() => String, { nullable: true })
  public serverUrl: string;

  @Field(() => String, { nullable: true })
  public streamKey: string;

  @Field(() => Boolean)
  public isLive: boolean;

  @Field(() => UserModel)
  public user: UserModel;

  @Field(() => String)
  public userId: string;

  @Field(() => CategoryModel, { nullable: true })
  public category: CategoryModel;

  @Field(() => String, { nullable: true })
  public categoryId: string;
  

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
