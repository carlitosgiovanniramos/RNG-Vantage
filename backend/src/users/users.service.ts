import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    return (await this.prisma.user.findUnique({
      where: { email },
    })) as AuthUser | null;
  }

  async create(data: {
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthUser> {
    return (await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role ?? 'admin',
      },
    })) as AuthUser;
  }
}
