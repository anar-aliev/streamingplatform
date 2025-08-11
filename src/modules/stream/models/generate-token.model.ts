import { Field, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class GenerateTokenModel {
  @Field(() => String)
  public token: string;
}