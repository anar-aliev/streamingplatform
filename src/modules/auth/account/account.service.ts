import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { CreateUserInput } from './input/create-user.input';
import { VerificationService } from '../verification/verification.service';
import { ChangeEmailInput } from './input/change-email.input';
import type { User } from 'generated/prisma';
import { ChangePasswordInput } from './input/change-password.input';

@Injectable()
export class AccountService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  public async me(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  public async create(input: CreateUserInput) {
    const { username, email, password } = input;

    const isUsernameExists = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (isUsernameExists) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: await hash(password),
        displayName: username,
        stream: {
          create: {
            title: `Stream ${username}`,
          },
        },
      },
    });

    await this.verificationService.sendVerificationEmail(user);

    return true;
  }

  public async changeEmail(user: User, input: ChangeEmailInput) {
    const { email } = input;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { email },
    });

    return true;
  }

  public async changePassword(user: User, input: ChangePasswordInput) {
    const { oldPassword, newPassword } = input;

    const isPasswordValid = await verify(user.password, oldPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await hash(newPassword) },
    });

    return true;
  }
}
