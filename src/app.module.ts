import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HelperService } from './helpers/helpers.service';
import { PrismaService } from './database/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { EmployeesModule } from './modules/employees/employees.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { AuthMiddleware } from './middleware/auth-middleware/auth-middleware.middleware';
import { EmployeesController } from './modules/employees/employees.controller';
import { EmployeesGateway } from './gateway/employees/employees.gateway';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        stores: [createKeyv('redis://localhost:6379')],
        ttl: 60 * 1000,
      }),
      isGlobal: true,
    }),
    // Rate Limiter
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Use as a global guard
    },
    AppService,
    HelperService,
    PrismaService,
    EmployeesGateway,
  ],
})
export class AppModule {
  async configure(consumer: MiddlewareConsumer) {
    await consumer
      .apply(AuthMiddleware)
      .forRoutes(EmployeesController);
  }
}
