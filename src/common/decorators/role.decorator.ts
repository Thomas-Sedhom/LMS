import {Reflector} from "@nestjs/core";
export let Roles = Reflector.createDecorator<string[]>()