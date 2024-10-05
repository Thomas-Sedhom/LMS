import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDTO {
  @IsOptional()
  @Type(() => Number) // Converts the query param to a number
  @IsInt({ message: 'page must be an integer' }) // Validates if it's an integer
  @Min(1, { message: 'page must be greater than or equal to 1' }) // Ensures page is at least 1
  page?: number;

  @IsOptional()
  @Type(() => Number) // Converts the query param to a number
  @IsInt({ message: 'limit must be an integer' }) // Validates if it's an integer
  @Min(1, { message: 'limit must be greater than or equal to 1' }) // Ensures limit is at least 1
  limit?: number;
}