import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { PartnerService } from './partner.service';

@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() tramas: string[]) {
    this.partnerService.iniciarProceso(tramas);
    return { message: 'Proceso iniciado' };
  }
}
