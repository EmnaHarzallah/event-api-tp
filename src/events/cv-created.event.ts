export class CvCreatedEvent {
 constructor(
   public cvId:number,
   public user:string,
   public timestamp:Date
 ){}
}