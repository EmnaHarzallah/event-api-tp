import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CvService } from './cv.service';
import { GetUser } from 'src/common/decorators/user.decorator';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('cv')
export class CvController {
 constructor(private cvService:CvService){}

@Post()
create(@Body() dto: CreateCvDto, @GetUser() user) {
  return this.cvService.create(dto, user.id);
}

@Get()
findAll(){
 return this.cvService.findAll();
}

@Put(':id')
update(
 @Param('id') id:number,
 @Body() dto: UpdateCvDto,
 @GetUser() user
){
 return this.cvService.update(id,dto,user.id);
}

@Delete(':id')
remove(
 @Param('id') id:number,
 @GetUser() user
){
 return this.cvService.remove(id,user.id);
}}