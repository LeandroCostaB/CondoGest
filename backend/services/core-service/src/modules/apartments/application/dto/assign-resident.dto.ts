import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AssignResidentDto {
  @ApiPropertyOptional({ example: "uuid", nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string | null;
}
