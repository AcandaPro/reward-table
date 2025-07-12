import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  _id: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashedpassword',
  points: 0,
  role: 'child',
};

const mockUserModel = {
  find: jest.fn().mockResolvedValue([mockUser]),
  findById: jest
    .fn()
    .mockImplementation((id) =>
      id === '123' ? Promise.resolve(mockUser) : Promise.resolve(null),
    ),
  findByIdAndUpdate: jest
    .fn()
    .mockImplementation((id, dto) =>
      id === '123'
        ? Promise.resolve({ ...mockUser, ...dto })
        : Promise.resolve(null),
    ),
  findByIdAndDelete: jest
    .fn()
    .mockImplementation((id) =>
      id === '123' ? Promise.resolve(mockUser) : Promise.resolve(null),
    ),
};

const mockUserModelConstructor = jest.fn().mockImplementation(() => ({
  ...mockUser,
  save: jest.fn().mockResolvedValue({ ...mockUser, password: 'hashed' }),
}));

Object.assign(mockUserModelConstructor, mockUserModel);

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModelConstructor,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with hashed password', async () => {
    const spy = jest.spyOn(bcrypt, 'hash') as jest.Mock;
    spy.mockResolvedValue('hashed');
    const dto = {
      firstName: 'A',
      lastName: 'B',
      email: 'c@c.com',
      password: 'pass123',
    };

    const result = await service.create(dto);
    expect(result.password).toBe('hashed');
  });

  it('findAll should return user array', async () => {
    const users = await service.findAll();
    expect(users).toHaveLength(1);
  });

  it('findOne should return a user by ID', async () => {
    const user = await service.findOne('123');
    expect(user.email).toBe('john@example.com');
  });

  it('findOne should throw if not found', async () => {
    await expect(service.findOne('404')).rejects.toThrow('User not found');
  });

  it('update should return updated user', async () => {
    const user = await service.update('123', { firstName: 'Updated' });
    expect(user.firstName).toBe('Updated');
  });

  it('update should throw if not found', async () => {
    await expect(
      service.update('404', { firstName: 'Updated' }),
    ).rejects.toThrow('User not found');
  });

  it('remove should not throw if found', async () => {
    await expect(service.remove('123')).resolves.toBeUndefined();
  });

  it('remove should throw if not found', async () => {
    await expect(service.remove('404')).rejects.toThrow('User not found');
  });
});
