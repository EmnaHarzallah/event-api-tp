import {
 Injectable,
 NotFoundException
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cv } from './entities/cv.entity';

@Injectable()
export class CvService {

 private cvs:Cv[]=[];

 constructor(
  private eventEmitter: EventEmitter2
 ){}

 create(data:any){

   const cv = new Cv(
      Date.now(),
      data.name,
      data.email,
      data.skills,
      data.owner
   );

   this.cvs.push(cv);

   this.eventEmitter.emit(
      'cv.created',
      {
       cv,
       user:data.owner,
       date:new Date()
      }
   );

   return cv;
 }

 findAll(){
   return this.cvs;
 }

 findOne(id:number){
   return this.cvs.find(c=>c.id===+id);
 }

 update(id:number,data:any){

   const cv=this.findOne(+id);

   if(!cv)
      throw new NotFoundException();

   Object.assign(cv,data);

   this.eventEmitter.emit(
      'cv.updated',
      {
        cv,
        date:new Date()
      }
   );

   return cv;
 }

remove(id:number){
   const cv=this.findOne(+id);
   if(!cv) throw new NotFoundException();
   this.eventEmitter.emit(
      'cv.deleted',
      {
       cv,
       date:new Date()
      }
   );
   this.cvs=this.cvs.filter(
      c=>c.id!==+id
   );
   return cv;
 }
}