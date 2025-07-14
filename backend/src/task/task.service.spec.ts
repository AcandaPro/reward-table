// 📁 reward-app-nest/src/task/task.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { Task } from './entities/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';

describe('TaskService', () => {
  let service: TaskService;
  let taskModel: jest.Mocked<Partial<Model<Task>>>;

  const mockTask = {
    _id: 'taskId',
    title: 'Test Task',
    description: 'Some description',
    status: 'started',
    points: 5,
    owner: 'userId',
    save: jest.fn().mockResolvedValue(this),
  } as unknown as Task;

  beforeEach(async () => {
    taskModel = {
      create: jest.fn(),
      find: jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockResolvedValue([mockTask]) }),
      findById: jest
        .fn()
        .mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTask) }),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockTask),
      findByIdAndDelete: jest.fn().mockResolvedValue(mockTask),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: taskModel,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and return a task', async () => {
    const dto: CreateTaskDto = { title: 'Task 1', points: 5 };
    const mockSave = jest.fn().mockResolvedValue(mockTask);

    const mockTaskInstance = {
      ...mockTask,
      ...dto,
      save: mockSave,
    };

    const mockTaskModel: any = jest
      .fn()
      .mockImplementation(() => mockTaskInstance);
    mockTaskModel.prototype.save = mockSave;

    const testService = new TaskService(mockTaskModel);
    const result = await testService.create(dto);
    expect(result).toEqual(mockTask);
  });

  it('should return an array of tasks', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockTask]);
    expect(taskModel.find).toHaveBeenCalled();
  });

  it('should return a task by ID', async () => {
    const result = await service.findOne('taskId');
    expect(result).toEqual(mockTask);
    expect(taskModel.findById).toHaveBeenCalledWith('taskId');
  });

  it('should throw NotFoundException if task not found', async () => {
    taskModel.findById = jest
      .fn()
      .mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    await expect(service.findOne('invalidId')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a task', async () => {
    const dto: UpdateTaskDto = { title: 'Updated Title' };
    const result = await service.update('taskId', dto);
    expect(result).toEqual(mockTask);
    expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith('taskId', dto, {
      new: true,
    });
  });

  it('should throw NotFoundException if update target not found', async () => {
    taskModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    await expect(
      service.update('missingId', {} as UpdateTaskDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a task', async () => {
    await expect(service.remove('taskId')).resolves.toBeUndefined();
    expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith('taskId');
  });

  it('should throw NotFoundException if remove target not found', async () => {
    taskModel.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    await expect(service.remove('missingId')).rejects.toThrow(
      NotFoundException,
    );
  });
});
