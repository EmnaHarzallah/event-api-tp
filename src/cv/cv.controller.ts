import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
 constructor(private cvService:CvService){}

@Post()
create(@Body() dto){
 return this.cvService.create(dto);
}

@Get()
findAll(){
 return this.cvService.findAll();
}

@Put(':id')
update(
 @Param('id') id:number,
 @Body() dto
){
 return this.cvService.update(id,dto);
}

@Delete(':id')
remove(
 @Param('id') id:number
){
 return this.cvService.remove(id);
}}