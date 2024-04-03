import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
    constructor(
      @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async create(data: any): Promise<User>{
        try {
            // Check if the email is already in use
            const user = await this.userRepository.findOneBy({email: data.email});
            if(user){
                throw new ConflictException('Email is already in use');
            }
            return await this.userRepository.save(data);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
        }
    }

    async findOneByEmail(email: string): Promise<User>{
        try {
            return await this.userRepository.findOneBy({email});
        } catch (error) {
            throw new InternalServerErrorException(`Failed to find user by email: ${error.message}`);
        }
    }

    async findOneById(id: number): Promise<User>{
        try {
            const user = await this.userRepository.findOneBy({id});
            if (!user) {
                throw new BadRequestException('User not found');
            }
            return user;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to find user by ID: ${error.message}`);
        }
    }

    async deleteUserByEmail(email: string): Promise<void> {
        try {
            const user = await this.findOneByEmail(email);
            await this.userRepository.remove(user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to delete user by email: ${error.message}`);
        }
    }

    async changeRole(email: string, userRole: string): Promise<void> {
        try {
            const user = await this.findOneByEmail(email);
            user.role = userRole;
            await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to change user role: ${error.message}`);
        }
    }
}
