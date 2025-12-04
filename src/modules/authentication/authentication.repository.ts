import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { HelperService } from 'src/helpers/helpers.service';
import { Prisma, PrismaClient} from "@prisma/client";



@Injectable()
export class AuthenticationRepository {
  constructor(
    private prisma: PrismaService,
    private helper: HelperService,
  ) {}

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.client.users.findUnique({
        where: { email: email },
      });

      if (!user)
        throw await this.helper.basicResponse(
          false,
          'Failed to fetch user, no user record found with inputed email',
        );

      return await this.helper.basicResponse(true, 'User found', user);
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

   async updateUser(
    where: Prisma.usersWhereUniqueInput,
    data: object,
    prismaTx?: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) {
    try {
      const prismaTrans = prismaTx || this.prisma.client;

      const updateUser = await prismaTrans.users.update({
        where: where,
        data: data,
      });

      if (!updateUser)
        throw await this.helper.basicResponse(false, "Failed To Update User");

      return this.helper.basicResponse(
        true,
        "Success to update user",
        { id: updateUser.id },
        200,
      );
    } catch (error: any) {
      error.message = "Database server error"


      if (error.code && error.code == "P2025") {
        error.message = "User with requested id not found";
      }

      return this.helper.basicResponse(
        false,
        error?.message || "Internal server error",
      );
    }
  }

}
