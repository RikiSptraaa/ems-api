import { IsNumber, IsNumberString, IsOptional } from "class-validator";

export class PaginationDto {
  @IsNumberString()
  @IsOptional()
  page?: string;

  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  obName?: "asc" | "desc";

  @IsOptional()
  obPosition?: "asc" | "desc";

  @IsOptional()
  obAge?: "asc" | "desc";

  @IsOptional()
  obSalary?: "asc" | "desc";

}
