import { Injectable, NestMiddleware } from '@nestjs/common';
import { HelperService } from 'src/helpers/helpers.service';
import { AuthenticationRepository } from 'src/modules/authentication/authentication.repository';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private helper: HelperService,
    private authRepository: AuthenticationRepository,
  ) {}
  async use(req: any, res: any, next: () => void) {
    const authToken = req.headers['authorization'];

    try {
      if (!authToken) throw new Error('Token is missing');

      const token = authToken.split(' ')[1];

      if (!token) throw new Error('Token is missing / wrong format');

      const secretKey: string = process.env.ACCESS_TOKEN_SECRET as string;

      const decode = jwt.verify(token, secretKey) as {
        id: string;
        fullName: string;
        email: string;
        position: string;
        address: string;
      };

      res.locals.id = decode.id;
      res.locals.fullName = decode.fullName;
      res.locals.email = decode.email;

      next();
    } catch (error: any) {
      try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
          console.log('Refresh token / Auth Token is missing');
          throw new Error('Refresh token / Auth Token is missing');
        }

        const secretKey = process.env.REFRESH_TOKEN_SECRET;

        if (!secretKey) {
          console.log('Refresh token secret is not set');
          throw new Error('Refresh token secret is not set');
        }

        let decoded;
        try {
          decoded = jwt.verify(refreshToken, secretKey) as {
            email: string;
            position: string;
          };
        } catch (err) {
          console.log('Error decoding refresh token:', err.message);
          throw new Error('Refresh token is invalid');
        }

        const email = decoded.email;

        if (!email) {
          console.log('Decoded token does not contain email');
          throw new Error('Invalid token payload');
        }

        let user;
        try {
          user = await this.authRepository.findByEmail(email);
        } catch (err) {
          console.log('Error finding user by email:', err.message);
          throw new Error('Error finding user by email');
        }

        if (!user.success) {
          console.log('User not found');
          throw new Error('User not found, please login');
        }

        if (user.data.refresh_token !== refreshToken) {
          console.log('Refresh token does not match');
          throw new Error('Refresh token is invalid');
        }

        res.locals.id = user.data.id;
        res.locals.fullName = user.data.full_name;
        res.locals.email = user.data.email;

        const userData = {
          id: user.data.id,
          fullName: user.data.full_name,
          email: user.data.email,
          position: user.data.position,
          address: user.data.address,
        };

        res.locals.newAccessToken =
          await this.helper.generateAccessToken(userData);

        next();
      } catch (error: any) {
        console.log(error);
        
        return res.status(401).json(
          await this.helper.basicResponse(
            false,
            error.message || 'Refresh token is invalid / missing',
            {
              code: 'ERR-AUTH-TOKEN',
            },
          ),
        );
      }
    }
  }
}
