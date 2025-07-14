import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskStatus } from './entities/task-status.enum';
import { RequestWithUser } from '../auth/types/request-with-user.interface';

type CreateDto = { title: string; points: number };

const mockTask = {
  _id: 'taskId',
  title: 'Task 1',
  description: 'A test task',
  status: TaskStatus.STARTED,
  points: 5,
  owner: 'userId',
};

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockService = {
    create: jest.fn().mockResolvedValue(mockTask),
    findAll: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const dto: CreateDto = { title: 'Task 1', points: 5 };
    const req = { user: { userId: 'userId' } } as unknown as RequestWithUser;
    const result = await controller.create(dto, req);
    expect(result).toEqual(mockTask);
    expect(service.create).toHaveBeenCalledWith({ ...dto, owner: 'userId' });
  });

  it('should return all tasks', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockTask]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a task by ID', async () => {
    const result = await controller.findOne('taskId');
    expect(result).toEqual(mockTask);
    expect(service.findOne).toHaveBeenCalledWith('taskId');
  });

  it('should update a task', async () => {
    const dto = { title: 'Updated' };
    const result = await controller.update('taskId', dto);
    expect(result).toEqual(mockTask);
    expect(service.update).toHaveBeenCalledWith('taskId', dto);
  });

  it('should delete a task', async () => {
    await expect(controller.remove('taskId')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith('taskId');
  });
});
