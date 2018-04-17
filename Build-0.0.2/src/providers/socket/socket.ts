import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';


@Injectable()
export class SocketProvider {
  
    private events; 

    constructor(public socket: Socket) {
        this.events = [];
    }

    // Intercept ON event
    on(event, callback) {
        // Check if the event is already bound
        if(!this.inArray(event, this.events)) {
            this.events.push(event);
            // Not bound, make new
            this.socket.on(event, callback);
        } else {
            // Bound, use event
            let index = this.events.indexOf(event);
            this.socket.on(this.events[index], callback);
        }
    }

    // Intercept EMIT events
    emit(event, data = {}) {
        this.socket.emit(event, data);
    }

    inArray(needle, arr) {
    	for(let i = 0; i < arr.length; i++) {
    		if(arr.indexOf(needle) === -1) {
    			return false;
    		}
    		return true;
    	}
    }
}  

