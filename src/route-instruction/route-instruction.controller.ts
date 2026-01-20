import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RouteInstructionService } from './route-instruction.service';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('route-instruction')
export class RouteInstructionController {
  constructor(private readonly routeInstructionService: RouteInstructionService) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() body: string) {
    await this.routeInstructionService.iniciarProceso(body);
    return { message: 'Proceso iniciado' };
  }
}
