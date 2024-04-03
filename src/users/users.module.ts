import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({

  // Import TypeOrmModule to enable TypeORM integration for CategoryEntity. This allows the module to use repository pattern for database operations.
  imports: [
    ConfigModule.forRoot(),

    JwtModule.registerAsync({
      imports: [ConfigModule], // Make ConfigModule available
      inject: [ConfigService], // Inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'), // Use ConfigService to get the JWT_SECRET
        signOptions: { expiresIn: '1d' },
      }),
    }),

    TypeOrmModule.forFeature([User]),


  ],
  // Register CategoriesController to handle incoming HTTP requests related to categories.
  controllers: [UsersController],
  // Provide CategoriesService to be used for business logic related to category operations and to be injected in controllers.
  providers: [UsersService],
  // Export CategoriesService to allow it to be reused in other modules within the NestJS application.
  exports: [UsersService]
})
export class UsersModule {}
