import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockUser = {
  _id: '123',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'hashedpassword',
  points: 0,
  role: 'child',
};

describe('UserController', () => {
  let controller: UserController;
  //let service: UserService;

  const mockUserService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest
      .fn()
      .mockImplementation((id) =>
        id === '123'
          ? Promise.resolve(mockUser)
          : Promise.reject(new Error('User not found')),
      ),
    update: jest
      .fn()
      .mockImplementation((id, dto) =>
        id === '123'
          ? Promise.resolve({ ...mockUser, ...dto })
          : Promise.reject(new Error('User not found')),
      ),
    remove: jest
      .fn()
      .mockImplementation((id) =>
        id === '123'
          ? Promise.resolve()
          : Promise.reject(new Error('User not found')),
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    //service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
    };
    expect(await controller.create(dto)).toEqual(mockUser);
    expect(mockUserService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all users', async () => {
    expect(await controller.findAll()).toEqual([mockUser]);
  });

  it('should return a user by id', async () => {
    expect(await controller.findOne('123')).toEqual(mockUser);
  });

  it('should throw when user not found', async () => {
    await expect(controller.findOne('404')).rejects.toThrow('User not found');
  });

  it('should update user', async () => {
    const update = { firstName: 'Updated' };
    expect(await controller.update('123', update)).toEqual({
      ...mockUser,
      ...update,
    });
  });

  it('should delete user', async () => {
    await expect(controller.remove('123')).resolves.toBeUndefined();
  });
});
