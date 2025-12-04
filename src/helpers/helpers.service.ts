import { Injectable } from '@nestjs/common';
import { users } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface AuthInfo {
  id: string;
  fullName: string;
  email: string;
  position: string;
  address: string;
}

@Injectable()
export class HelperService {
  async basicResponse(
    success: boolean,
    message: string,
    data?: any,
    status?: number,
  ) {
    return {
      success: success,
      message: message,
      data: data,
      status: status,
    };
  }

  async generateAccessToken(data: AuthInfo) {
    return jwt.sign(
      {
        id: data.id,
        fullName: data.fullName,
        email: data.fullName,
        position: data.position,
        address: data.address,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '30m', algorithm: 'HS256' },
    );
  }

    async generateRefreshToken(data: users) {
    return jwt.sign(
      {
          email: data.email,
          position: data.position,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "30d" },
    );
  }
}
