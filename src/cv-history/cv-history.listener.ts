import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { APP_EVENTS } from "../config/event.config";

@Injectable() 
export class SkillListener { 
    @OnEvent(APP_EVENTS.CvCreated) async handleCvAdded(payload: any) {      
    console.log({payload});
    }
}