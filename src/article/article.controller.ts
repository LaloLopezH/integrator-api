import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() tramas: string[]) {
    //await this.articleService.procesaTramas(tramas);
    this.articleService.iniciarProceso(tramas);
    return { message: 'Proceso iniciado' };
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
