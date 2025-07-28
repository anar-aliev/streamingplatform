import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StreamService } from './stream.service';
import { StreamModel } from './models/stream.model';
import { FiltersInput } from './inputs/filters.input';
import { Authorization } from 'src/shared/decorators/auth.decorator';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import * as GraphqlUpload from 'graphql-upload/GraphQLUpload.js';
import * as Upload from 'graphql-upload/Upload.js';
import { Authorized } from 'src/shared/decorators/authorized.decorator';
import type { User } from 'generated/prisma';
import { FileValidationPipe } from 'src/shared/pipes/file-validation.pipe';

@Resolver('Stream')
export class StreamResolver {
  constructor(private readonly streamService: StreamService) {}

  @Query(() => [StreamModel], { name: 'findAllStreams' })
  public async findAllStreams(@Args('filters') input: FiltersInput) {
    return this.streamService.findAll(input);
  }

  @Query(() => [StreamModel], { name: 'findRandomStreams' })
  public async findRandomStreams() {
    return this.streamService.findRandom();
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeStreamInfo' })
  public async changeStreamInfo(
    @Authorized() user: User,
    @Args('data') input: ChangeStreamInfoInput,
  ) {
    return this.streamService.changeStreamInfo(user, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeStreamThumbnail' })
  public async changeStreamThumbnail(
    @Authorized() user: User,
    @Args('thumbnail', { type: () => GraphqlUpload }, FileValidationPipe)
    thumbnail: Upload,
  ) {
    return this.streamService.changeThumbnail(user, thumbnail);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeStreamThumbnail' })
  public async removeStreamThumbnail(@Authorized() user: User) {
    return this.streamService.removeThumbnail(user);
  }
}
