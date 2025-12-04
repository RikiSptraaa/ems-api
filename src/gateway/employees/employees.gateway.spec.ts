import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesGateway } from './employees.gateway';

describe('EmployeesGateway', () => {
  let gateway: EmployeesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesGateway],
    }).compile();

    gateway = module.get<EmployeesGateway>(EmployeesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
