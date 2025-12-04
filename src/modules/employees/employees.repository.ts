import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { HelperService } from 'src/helpers/helpers.service';
import { employees, Prisma, PrismaClient } from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { pagination } from 'prisma-extension-pagination';
import { employeesCreateManyInput } from 'generated/prisma/models';

type sort = 'asc' | 'desc' | null;

@Injectable()
export class EmployeesRepository {
  constructor(
    private prisma: PrismaService,
    private helper: HelperService,
  ) {}

  async createEmployee(
    data: CreateEmployeeDto,
    prismaTx?: Prisma.TransactionClient,
  ) {
    try {
      const prismaTrans: any = prismaTx || this.prisma.client;

      const createEmployee = await prismaTrans.employees.create({
        data: {
          name: data.name,
          position: data.position,
          age: data.age,
          salary: data.salary,
        },
      });

      if (!createEmployee)
        throw await this.helper.basicResponse(
          false,
          'Failed To Create Employee',
        );

      return this.helper.basicResponse(
        true,
        'Success to create employee',
        { id: createEmployee.id },
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

  async createMany(employees: employeesCreateManyInput[]) {
    try {
        console.log(employees[0]);
        
      const bulk = await this.prisma.client.employees.createMany({ data: employees });

      if (!bulk)
        throw await this.helper.basicResponse(
          false,
          'Failed To Create Batch Of Employee',
        );

      return await this.helper.basicResponse(
        true,
        'Success to create employee',
        null,
        200,
      );
    } catch (error: any) {
      return await this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

  async update(
    where: Prisma.employeesWhereUniqueInput,
    data: object,
    prismaTx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    try {
      const prismaTrans: any = prismaTx || this.prisma.client;

      const result = await prismaTrans.employees.update({
        where: where,
        data: data,
      });

      if (!result)
        throw await this.helper.basicResponse(
          false,
          'Failed to update employee',
          null,
          400,
        );

      return await this.helper.basicResponse(
        true,
        'Success to update employee',
        result,
        200,
      );
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

  async getAll(
    limit: number,
    page: number,
    search?: string,
    sort?: {
      name?: sort;
      age?: sort;
      salary?: sort;
    },
  ) {
    try {
      // Note: Saya melakukan dynamic query agar saat tidak melakukan filter, search atau sort query tidak berat
      const config: {
        where?: Prisma.employeesWhereInput;
        orderBy?: Prisma.employeesOrderByWithAggregationInput[];
        select?: Prisma.employeesSelect;
      } = {};

      if (search) {
        config.where = config.where || {};

        config.where.OR = config.where.OR || [];

        config.where.OR.push({
          name: { contains: search, mode: 'insensitive' },
        });
      }

      if (sort.name) {
        config.orderBy = config.orderBy || [];
        config.orderBy.push({ name: sort.name });
      }

      if (sort.age) {
        config.orderBy = config.orderBy || [];
        config.orderBy.push({ created_at: sort.age });
      }

      if (sort.salary) {
        config.orderBy = config.orderBy || [];
        config.orderBy.push({ salary: sort.salary });
      }

      const user = await this.prisma.client
        .$extends(pagination())
        .employees.paginate(config)
        .withPages({ page: page, limit: limit, includePageCount: true });

      if (!user)
        throw await this.helper.basicResponse(
          false,
          'Failed to fetch employees',
        );

      return this.helper.basicResponse(true, 'All Employees are Fetched', user);
    } catch (error: any) {
      console.log(error);

      error.message = 'Database server error';

      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

  async getById(employeeId: string) {
    try {
      const employee = await this.prisma.client.employees.findUnique({
        where: { id: employeeId },
      });

      if (!employee)
        throw await this.helper.basicResponse(
          false,
          'Failed get employee, there is no employee with inputed id ',
          null,
          400,
        );

      return this.helper.basicResponse(true, 'Employee found', employee);
    } catch (error: any) {
      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
      );
    }
  }

  async delete(
    employeeId: string,
    prismaTx?: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    try {
      const prismaTrans: any = prismaTx || this.prisma.client;
      const removeUser = await prismaTrans.employees.delete({
        where: { id: employeeId },
      });

      if (!removeUser)
        throw await this.helper.basicResponse(
          false,
          'Failed to remove employee',
          null,
          400,
        );

      return this.helper.basicResponse(
        true,
        'Success to remove employee',
        { id: removeUser.id },
        200,
      );
    } catch (error: any) {
      if (error.code && error.code == 'P2025') {
        error.message = 'Employee with requested id not found';
      }

      return this.helper.basicResponse(
        false,
        error?.message || 'Internal server error',
        null,
        500,
      );
    }
  }
}
