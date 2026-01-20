import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { IhtService } from './iht.service';
import { UpdateIhtDto } from './dto/update-iht.dto';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('iht')
export class IhtController {
  constructor(private readonly ihtService: IhtService) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() body: string) {
    this.ihtService.iniciarProceso(body);
    return { message: 'Proceso iniciado' };
  }
}
