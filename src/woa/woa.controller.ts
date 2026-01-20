import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WoaService } from './woa.service';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { ProcessFilesService } from './process-files.service';

@Controller('woa')
export class WoaController {
  constructor(private readonly woaService: WoaService,
              private readonly processFilesService: ProcessFilesService
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  create(@Body() trama: string) {
    this.woaService.iniciarProceso(trama);
    return { message: 'Proceso iniciado' };
  }

  @Post('reprocess-file')
  @UseGuards(BasicAuthGuard)
  reprocessFile(@Body() trama: string) {
    this.processFilesService.iniciarProceso(trama);
    return { message: 'Proceso iniciado' };
  }
}
