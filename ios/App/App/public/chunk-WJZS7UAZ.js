import{d as i,g as r}from"./chunk-DBCAJTRU.js";var d=class extends r{constructor(){super()}loadScript(){if(typeof document>"u")return;let e="gapi";if(document?.getElementById(e))return;let n=document.getElementsByTagName("head")[0],t=document.createElement("script");t.type="text/javascript",t.defer=!0,t.async=!0,t.id=e,t.onload=this.platformJsLoaded.bind(this),t.src="https://apis.google.com/js/platform.js",n.appendChild(t)}initialize(e={clientId:"",scopes:[],grantOfflineAccess:!1}){var s,n;if(typeof window>"u")return;let t=(s=document.getElementsByName("google-signin-client_id")[0])===null||s===void 0?void 0:s.content,a=e.clientId||t||"";return a||console.warn("GoogleAuthPlugin - clientId is empty"),this.options={clientId:a,grantOfflineAccess:(n=e.grantOfflineAccess)!==null&&n!==void 0?n:!1,scopes:e.scopes||[]},this.gapiLoaded=new Promise(o=>{window.gapiResolve=o,this.loadScript()}),this.addUserChangeListener(),this.gapiLoaded}platformJsLoaded(){gapi.load("auth2",()=>{let e={client_id:this.options.clientId,plugin_name:"CodetrixStudioCapacitorGoogleAuth"};this.options.scopes.length&&(e.scope=this.options.scopes.join(" ")),gapi.auth2.init(e),window.gapiResolve()})}signIn(){return i(this,null,function*(){return new Promise((e,s)=>i(this,null,function*(){var n;try{let t,a=(n=this.options.grantOfflineAccess)!==null&&n!==void 0?n:!1;a?t=(yield gapi.auth2.getAuthInstance().grantOfflineAccess()).code:yield gapi.auth2.getAuthInstance().signIn();let o=gapi.auth2.getAuthInstance().currentUser.get();a&&(yield o.reloadAuthResponse());let c=this.getUserFrom(o);c.serverAuthCode=t,e(c)}catch(t){s(t)}}))})}refresh(){return i(this,null,function*(){let e=yield gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();return{accessToken:e.access_token,idToken:e.id_token,refreshToken:""}})}signOut(){return i(this,null,function*(){return gapi.auth2.getAuthInstance().signOut()})}addUserChangeListener(){return i(this,null,function*(){yield this.gapiLoaded,gapi.auth2.getAuthInstance().currentUser.listen(e=>{this.notifyListeners("userChange",e.isSignedIn()?this.getUserFrom(e):null)})})}getUserFrom(e){let s={},n=e.getBasicProfile();s.email=n.getEmail(),s.familyName=n.getFamilyName(),s.givenName=n.getGivenName(),s.id=n.getId(),s.imageUrl=n.getImageUrl(),s.name=n.getName();let t=e.getAuthResponse(!0);return s.authentication={accessToken:t.access_token,idToken:t.id_token,refreshToken:""},s}};export{d as GoogleAuthWeb};
