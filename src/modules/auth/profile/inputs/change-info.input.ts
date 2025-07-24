import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

@InputType()
export class ChangeInfoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'Username must contain only English letters and numbers',
  })
  public username: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  public displayName: string;

  @Field()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  public bio: string;
}
