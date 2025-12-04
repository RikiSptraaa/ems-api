import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  Res,
  UseGuards,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  FileTypeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from './dto/pagination.dto.';
import { HelperService } from 'src/helpers/helpers.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { employees } from '@prisma/client';
import { parse } from 'fast-csv';
import { EmployeesQueue } from './employees.queue';
import { Readable } from 'stream';

@Controller('employees')
@UseGuards()
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private helper: HelperService,
    private employeeQueue: EmployeesQueue,
  ) {}

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('csv'))
  async importCSV(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    csv: Express.Multer.File,
    @Res() res: Response,
  ) {
    const BATCH_SIZE = 100;
    let employees: employees[] = [];

    try {
      if (csv.mimetype != 'text/csv')
        throw await this.helper.basicResponse(
          false,
          'Only allowed to upload csv',
          null,
          401,
        );
        
      return res.status(200).json(
        await new Promise((resolve, reject) => {
          Readable.from(csv.buffer)
            .pipe(parse({ headers: true }))
            .on('error', (err) => {
              reject(err);
            })
            .on('data', (row) => {
              employees.push(row);

              if (employees.length === BATCH_SIZE) {
                this.employeeQueue.addImportJob([...employees]);
                employees = [];
              }
            })
            .on('end', async () => {
              try {
                if (employees.length > 0) {
                  await this.employeeQueue.addImportJob([...employees]);
                }

                resolve(
                  this.helper.basicResponse(
                    true,
                    'CSV uploaded & queued successfully',
                  ),
                );
              } catch (err) {
                reject(err);
              }
            });
        }),
      );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }

  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Res() res: Response,
  ) {
    try {
      const createService =
        await this.employeesService.create(createEmployeeDto);

      if (!createService.success)
        throw await this.helper.basicResponse(
          false,
          createService.message || 'Failed to create employee',
          null,
          400,
        );

      return res
        .status(200)
        .json(
          await this.helper.basicResponse(
            true,
            createService.message,
            createService.data,
          ),
        );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() query: PaginationDto, @Res() res?: Response) {
    try {
      const sort = {
        name: query.obName || null,
        age: query.obAge || null,
        salary: query.obSalary || null,
      };

      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 10;

      const createService = await this.employeesService.findAll(
        page,
        limit,
        query.search,
        sort,
      );

      if (!createService)
        throw await this.helper.basicResponse(
          false,
          createService.message,
          null,
          400,
        );

      return res
        .status(createService.status)
        .json(
          await this.helper.basicResponse(
            true,
            createService.message || 'Success to fetch employees',
            createService.data,
            createService.status || 200,
          ),
        );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const findService = await this.employeesService.findOne(id);

      if (!findService)
        throw await this.helper.basicResponse(
          false,
          findService.message || 'Failed to find employee with id',
          null,
          404,
        );

      return res
        .status(findService.status)
        .json(
          await this.helper.basicResponse(
            true,
            findService.message || 'Success to fetch employee',
            findService.data,
            findService.status || 200,
          ),
        );
    } catch (error: any) {}
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Res() res: Response,
  ) {
    try {
      const updateService = await this.employeesService.update(
        id,
        updateEmployeeDto,
      );

      if (!updateService.success)
        throw await this.helper.basicResponse(
          false,
          updateService.message || 'Failed to update employee',
          null,
          400,
        );

      return res
        .status(updateService.status || 200)
        .json(
          await this.helper.basicResponse(
            true,
            updateService.message || 'Success to update employee data',
            updateService.data,
          ),
        );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const removeService = await this.employeesService.remove(id);

      if (!removeService.success)
        throw await this.helper.basicResponse(
          false,
          removeService.message || 'Failed to remove employee',
          null,
          400,
        );

      return res
        .status(removeService.status || 200)
        .json(
          await this.helper.basicResponse(
            true,
            removeService.message || 'Success to remove employee data',
            removeService.data,
          ),
        );
    } catch (error: any) {
      return res
        .status(error.status || 500)
        .json(
          await this.helper.basicResponse(
            false,
            error?.message || 'Internal server error',
          ),
        );
    }
  }
}
