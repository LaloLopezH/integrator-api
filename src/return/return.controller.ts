import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { ReturnService } from './return.service';

@Controller('return')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

 @Post()
   @UseGuards(BasicAuthGuard)
   async create(@Body() trama: string) {
     this.returnService.iniciarProceso(trama);
      return { message: 'Proceso iniciado' };
   }
}
