import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

 @Post()
   @UseGuards(BasicAuthGuard)
   async create(@Body() trama: string) {
    this.testService.iniciarProceso(trama);
    return { message: 'Proceso iniciado' };
   }

 @Post("return")
   @UseGuards(BasicAuthGuard)
   async return(@Body() trama: string) {
    await this.testService.sendReturn(trama);
  }

 @Post("separator")
   @UseGuards(BasicAuthGuard)
   async createSeparator(@Body() trama: string) {
    await this.testService.createSeparator(trama);
  }

  @Get("health")
    health() {
      return 'OK';
    }
}
