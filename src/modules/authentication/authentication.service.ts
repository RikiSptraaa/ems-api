import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthenticationRepository } from './authentication.repository';
import { HelperService } from 'src/helpers/helpers.service';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AuthenticationService {
  constructor(
    private userRepository: AuthenticationRepository,
    private helper: HelperService,
  ) {}
  async signInService(req: SignInDto) {
    try {
      const checkUser = await this.userRepository.findByEmail(req.email);

      if (!checkUser.success)
        throw await this.helper.basicResponse(
          false,
          checkUser.message || 'Failed to sign in, user not found',
          null,
          404,
        );

      const validatePassword = await bcrypt.compare(
        req.password,
        checkUser.data.password,
      );

      if (!validatePassword)
        throw await this.helper.basicResponse(
          false,
          'Invalid inputed password',
          null,
          401,
        );

      const userInfo = {
        id: checkUser.data.id,
        fullName: checkUser.data.full_name,
        email: checkUser.data.email,
        position: checkUser.data.position,
        address: checkUser.data.address,
      };

      const accessToken = await this.helper.generateAccessToken(userInfo);
      const refreshToken = await this.helper.generateRefreshToken(
        checkUser.data,
      );

      const updateRefreshToken = await this.userRepository.updateUser(
        { email: checkUser.data.email },
        { refresh_token: refreshToken },
      );

      if (!updateRefreshToken.success)
        throw await this.helper.basicResponse(
          false,
          updateRefreshToken.message || 'Failed to update refresh token',
          null,
          updateRefreshToken.status || 500,
        );

      return this.helper.basicResponse(true, 'Sign In Success', {
        accessToken: accessToken,
        refreshToken: refreshToken,
        id: checkUser.data.id,
      });
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }
}
