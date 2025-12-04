import { Injectable, UploadedFile } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesRepository } from './employees.repository';
import { HelperService } from 'src/helpers/helpers.service';

@Injectable()
export class EmployeesService {
  constructor(
    private employeeRepo: EmployeesRepository,
    private helper: HelperService,
  ) {}
  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const createQuery =
        await this.employeeRepo.createEmployee(createEmployeeDto);

      if (!createQuery.success)
        throw await this.helper.basicResponse(
          false,
          createQuery.message || 'Failed to create employee',
          null,
          400,
        );

      return this.helper.basicResponse(
        true,
        createQuery.message || 'Success to create employee',
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        undefined,
        400,
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sort?: {
      name?: 'asc' | 'desc';
      age?: 'asc' | 'desc';
      salary?: 'asc' | 'desc';
    },
  ) {
    try {
      const employees = await this.employeeRepo.getAll(
        limit,
        page,
        search,
        sort,
      );

      if (!employees.success)
        throw await this.helper.basicResponse(
          false,
          employees.message || 'Failed to fetch all employees',
        );

      return await this.helper.basicResponse(
        true,
        employees.message || 'Success to fetch employees',
        employees.data,
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        undefined,
        400,
      );
    }
  }

  async findOne(id: string) {
    try {
      const employee = await this.employeeRepo.getById(id);

      if (!employee.success)
        throw await this.helper.basicResponse(
          false,
          employee.message || 'Failed to get employee',
          null,
          400,
        );

      return await this.helper.basicResponse(
        true,
        employee?.message,
        employee.data,
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        undefined,
        400,
      );
    }
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const update = await this.employeeRepo.update(
        { id: id },
        {
          name: updateEmployeeDto.name,
          age: updateEmployeeDto.age,
          position: updateEmployeeDto.position,
          salary: updateEmployeeDto.salary,
          updated_at: new Date()
        },
      );

      if (!update.success)
        throw await this.helper.basicResponse(
          false,
          update.message || 'Failed to update employee',
          null,
          400,
        );

      return await this.helper.basicResponse(
        true,
        update?.message,
        update.data,
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        undefined,
        400,
      );
    }
  }

  async remove(id: string) {
    try {
      const remove = await this.employeeRepo.delete(id);

      if (!remove.success)
        throw await this.helper.basicResponse(
          false,
          remove.message || 'Failed to remove employee',
          null,
          400,
        );

      return await this.helper.basicResponse(
        true,
        remove.message,
        remove.data.id,
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        undefined,
        400,
      );
    }
  }

}
