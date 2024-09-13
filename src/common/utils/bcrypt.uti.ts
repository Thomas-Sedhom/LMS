import * as bcrypt from 'bcrypt';
import {BadRequestException, HttpException, HttpStatus} from "@nestjs/common";
// import {BadRequestException} from "../errors/badRequestException";
const saltNumber: number = 10;
export const hashPass = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltNumber);
  const hashPassword: string = await bcrypt.hash(password, salt);
  return hashPassword
}

export const comparePass = async (password: string, hashPassword: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashPassword);
  if (!isMatch) {
    console.log(HttpStatus.BAD_REQUEST)
    throw new BadRequestException("wrong password");
  }
  return true; // Explicitly return true/false based on comparison
};