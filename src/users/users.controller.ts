import { Controller, Body, Post, Res, Delete, BadRequestException, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { AuthGuard } from "../guards/auth.guard";
import { Roles } from "../decorators/roles.decorator";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(
      private readonly usersService: UsersService,
      private jwtService: JwtService
    ) {}

    @Post('register')
    async register(
      @Body('name') name: string,
      @Body('email') email: string,
      @Body('password') password: string
    ) {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            return await this.usersService.create({
                username: name,
                email,
                password: hashedPassword,
            });
        } catch (error) {
            throw new BadRequestException('Registration failed');
        }
    }

    @Post('change-role')
    @Roles(['ADMIN'])
    @UseGuards(AuthGuard)
    async changeRole(@Body('email') email: string, @Body('role') role: string) {
        try {
            await this.usersService.changeRole(email, role);
        } catch (error) {
            throw new BadRequestException('User not found or role change failed');
        }
        return { message: 'Role changed successfully' };
    }

    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string, @Res({ passthrough: true }) response: Response) {
        try {
            const user = await this.usersService.findOneByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                throw new BadRequestException('Invalid credentials');
            }
            const jwt = await this.jwtService.signAsync({ id: user.id });
            return {
                message: 'Success',
                token: jwt
            };
        } catch (error) {
            throw new BadRequestException('Login failed');
        }
    }

    @Delete('delete')
    @Roles(['ADMIN'])
    @UseGuards(AuthGuard)
    async deleteUserByEmail(@Body('email') email: string) {
        try {
            await this.usersService.deleteUserByEmail(email);
        } catch (error) {
            throw new BadRequestException('User deletion failed');
        }
        return { message: 'User deleted successfully' };
    }
}
