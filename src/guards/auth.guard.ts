import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorators/roles.decorator";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private usersService: UsersService,
                private jwtService: JwtService,
                private reflector: Reflector) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token is missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            const user = await this.usersService.findOneById(payload.id);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const requiredRoles = this.reflector.get<string[]>(Roles, context.getHandler());
            if (!requiredRoles) {
                request.user = user; // Attach user to the request object
                return true;
            }

            if (requiredRoles.includes(user.role)) {
                request.user = user; // Optionally attach user to the request object
                return true;
            } else {
                throw new UnauthorizedException('Unauthorized role');
            }
        } catch (error) {
            // You could log the error here or perform other error handling as needed
            throw new UnauthorizedException('Unauthorized access');
        }
    }
}
