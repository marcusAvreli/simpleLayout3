import * as moment from 'moment';

import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { HttpClient,HttpHeaders  } from "@angular/common/http";
import { Ret } from "../../ret";
import { SERVER, JWT_RENEWAL_INTERVAL } from "../../configs";
import { catchError, timeout } from "rxjs/operators";
import { of } from 'rxjs/observable/of';


//declare var TextEncoder: any
@Injectable()
export class AuthService {
 private authStatusListener = new Subject<boolean>();
    private tokenRenewInterval: any = null;
	private newObj:string = "0";
	 games = {} as Ret;
	  constructor(private http: HttpClient) {
		console.log("auth_constructor_called");
		   (async () => {
            
                this.loadEthAddressAsMain(
                    localStorage.getItem("ethAddress"),
                    localStorage.getItem("token"),
                    moment.utc(localStorage.getItem("planValidUntil")).toDate()
                 );
                await this.renewToken();
            

        })();
		
		console.log("auth_constructor_finished");
	  }
	   loadEthAddressAsMain(address: string, token: string, planValidUntil: Date){
	   console.log("loadEthAddressAsMain_called");
	     this.activateRenewInterval();  
	   }
	      public isAuthenticated() {
        if (this.getToken()) {
            return true;
        } else {
            return false;
        }
    }
	  public getToken() {
        return localStorage.getItem("token");
    }
	   async renewToken() {
       console.log("renew_token_called");
	  // const textEncoder = new TextEncoder();
	  // let utf8Encode = new TextEncoder();
	  const encoder = new (window as any).TextEncoder('utf8');
var bytesArray = "Basic "+encoder.encode("ectAJlZCfeb1AvhGgozgj7dkYl7gDVLa:m34XrqOjqDjz9HSx");

   
	
        try {
			const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' ,'Authorization':bytesArray})
}; 
   // const body=JSON.stringify(person);
            var ret = await this.http.post<Ret>(SERVER + "/oauth2/generateToken" , null,httpOptions).pipe(
               // timeout(30000), // in ms
                /*catchError((err) => {
                    if (err.name == "HttpErrorResponse" && err.statusText == "Unknown Error") {
                        return of(<Ret>{status: "noop"});
                    } else if (err.name == "HttpErrorResponse" && (err.status == 401 || err.statusText == "Unauthorized")) {
                        return of(<Ret>{status: "unauthorized", message: `HTTP ${err.status}: ${err.message}`});
                    }
                    return of(<Ret>{status: "error", message: `HTTP ${err.status}: ${err.message}`});
                })*/
				//catchError((err) => console.log("error_happend"))
            ).toPromise().then(res => {this.games = res;}) ;
			console.log("games_objec:"+this.games.access_token);
			console.log("games_objec:"+this.games.expires_in);
			timeout(this.games.expires_in);
			// this.tokenRenewInterval=this.games.expires_in;
			 
			    var numberValue = (this.games.expires_in);
                localStorage.setItem("token", this.games.access_token);
				 localStorage.setItem("expires_in", ""+(numberValue)+"");
                
/*
            if (ret.status == 'noop') {
                // do nothing;
				console.log("do_nothing");
            }
*/			

        } catch(e) {
          // Could not renew the token 
          // TODO: here you can decide to sign out the user, or keep the user signed in and kick him out from the backend.
        }
    }
	
	  private activateRenewInterval() {
	  console.log("active_renew_called");
        if (this.tokenRenewInterval) {
            clearInterval(this.tokenRenewInterval);
        }
 this.newObj = localStorage.getItem("expires_in");
 console.log("new obj: "+this.newObj);
        this.tokenRenewInterval = setInterval(() => {
            (async () => {
                await this.renewToken();
            })();
        }, Number(this.newObj)*1000);
    }

}