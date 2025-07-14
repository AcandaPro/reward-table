import { IsOptional } from 'class-validator';
import { TaskStatus } from '../entities/task-status.enum';

export class UpdateTaskDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  points?: number;

  @IsOptional()
  owner?: string;
}
