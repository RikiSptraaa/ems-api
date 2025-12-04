import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { HelperService } from 'src/helpers/helpers.service';
import { Request, Response } from 'express';
import { Session } from 'express-session';

interface MySessionData {
  visited?: boolean;
  lastActivity?: number;
}

interface ExtendedRequest extends Request {
  session: Session & Partial<MySessionData>;
}

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly helper: HelperService,
  ) {}

  @Post('/sign-in')
  async signIn(
    @Body() sigInDto: SignInDto,
    @Req() req?: ExtendedRequest,
    @Res() res?: Response,
  ) {
    try {
      const signInAttempt =
        await this.authenticationService.signInService(sigInDto);

      if (!signInAttempt.success)
        throw await this.helper.basicResponse(
          false,
          signInAttempt.message || 'Internal server error',
          null,
          400,
        );

      const sessionData = req.session as MySessionData;

      sessionData.lastActivity = Date.now();

      sessionData.visited = true;

      req.session.save(async (err) => {
        if (err) {
          throw await this.helper.basicResponse(
            false,
            'Error saving session',
            null,
            400,
          );
        }
      });

      const { accessToken, refreshToken } = signInAttempt.data;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Cookie cannot be accessed via JavaScript (for security)
        secure: true, // Send cookie only over HTTPS (set to true in production)
        sameSite: 'none', // Allows the cookie to be sent in cross-site requests
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds (2592000000)
      });

      return res.status(200).json(
        await this.helper.basicResponse(true, 'Login success', {
          accessToken: accessToken,
          refreshToken: refreshToken,
        }),
      );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }
}
