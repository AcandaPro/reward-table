import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard) // Auth obligatoire pour toutes les routes
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.taskService.create({
      ...createTaskDto,
      owner: req.user.userId,
    });
  }

  @Get()
  @Roles(Role.Admin, Role.Manager, Role.Viewer)
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Manager, Role.Viewer)
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.Manager)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Manager)
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
