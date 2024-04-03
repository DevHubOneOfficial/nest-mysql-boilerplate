import {Reflector} from "@nestjs/core";


export const Roles = Reflector.createDecorator<string[]>(); // Create a decorator called Roles that takes an array of strings