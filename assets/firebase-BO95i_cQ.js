var va={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wc=function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let r=t.charCodeAt(s);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&s+1<t.length&&(t.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++s)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},Cd=function(t){const e=[];let n=0,s=0;for(;n<t.length;){const r=t[n++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=t[n++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=t[n++],o=t[n++],a=t[n++],c=((r&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[s++]=String.fromCharCode(55296+(c>>10)),e[s++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],o=t[n++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Qc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<t.length;r+=3){const i=t[r],o=r+1<t.length,a=o?t[r+1]:0,c=r+2<t.length,u=c?t[r+2]:0,l=i>>2,h=(i&3)<<4|a>>4;let d=(a&15)<<2|u>>6,p=u&63;c||(p=64,o||(d=64)),s.push(n[l],n[h],n[d],n[p])}return s.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Wc(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Cd(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<t.length;){const i=n[t.charAt(r++)],a=r<t.length?n[t.charAt(r)]:0;++r;const u=r<t.length?n[t.charAt(r)]:64;++r;const h=r<t.length?n[t.charAt(r)]:64;if(++r,i==null||a==null||u==null||h==null)throw new kd;const d=i<<2|a>>4;if(s.push(d),u!==64){const p=a<<4&240|u>>2;if(s.push(p),h!==64){const y=u<<6&192|h;s.push(y)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class kd extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Rd=function(t){const e=Wc(t);return Qc.encodeByteArray(e,!0)},Us=function(t){return Rd(t).replace(/\./g,"")},Xc=function(t){try{return Qc.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nd(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dd=()=>Nd().__FIREBASE_DEFAULTS__,Od=()=>{if(typeof process>"u"||typeof va>"u")return;const t=va.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Pd=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Xc(t[1]);return e&&JSON.parse(e)},or=()=>{try{return Dd()||Od()||Pd()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Yc=t=>{var e,n;return(n=(e=or())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},Jc=t=>{const e=Yc(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),s]:[e.substring(0,n),s]},Zc=()=>{var t;return(t=or())===null||t===void 0?void 0:t.config},eu=t=>{var e;return(e=or())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Md{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,s)=>{n?this.reject(n):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,s))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tu(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},s=e||"demo-project",r=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t);return[Us(JSON.stringify(n)),Us(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ld(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(le())}function xd(){var t;const e=(t=or())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ud(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function Fd(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Vd(){const t=le();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Bd(){try{return typeof indexedDB=="object"}catch{return!1}}function $d(){return new Promise((t,e)=>{try{let n=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(s),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{var i;e(((i=r.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qd="FirebaseError";class Ue extends Error{constructor(e,n,s){super(n),this.code=e,this.customData=s,this.name=qd,Object.setPrototypeOf(this,Ue.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Wn.prototype.create)}}class Wn{constructor(e,n,s){this.service=e,this.serviceName=n,this.errors=s}create(e,...n){const s=n[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?jd(i,s):"Error",a=`${this.serviceName}: ${o} (${r}).`;return new Ue(r,a,s)}}function jd(t,e){return t.replace(zd,(n,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const zd=/\{\$([^}]+)}/g;function Hd(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Fs(t,e){if(t===e)return!0;const n=Object.keys(t),s=Object.keys(e);for(const r of n){if(!s.includes(r))return!1;const i=t[r],o=e[r];if(_a(i)&&_a(o)){if(!Fs(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!n.includes(r))return!1;return!0}function _a(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qn(t){const e=[];for(const[n,s]of Object.entries(t))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Kd(t,e){const n=new Gd(t,e);return n.subscribe.bind(n)}class Gd{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,s){let r;if(e===void 0&&n===void 0&&s===void 0)throw new Error("Missing Observer.");Wd(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:s},r.next===void 0&&(r.next=Qr),r.error===void 0&&(r.error=Qr),r.complete===void 0&&(r.complete=Qr);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Wd(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Qr(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U(t){return t&&t._delegate?t._delegate:t}class ct{constructor(e,n,s){this.name=e,this.instanceFactory=n,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qd{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const s=new Md;if(this.instancesDeferred.set(n,s),this.isInitialized(n)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:n});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Yd(e))try{this.getOrInitializeService({instanceIdentifier:gt})}catch{}for(const[n,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=gt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=gt){return this.instances.has(e)}getOptions(e=gt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:n});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);s===a&&o.resolve(r)}return r}onInit(e,n){var s;const r=this.normalizeInstanceIdentifier(n),i=(s=this.onInitCallbacks.get(r))!==null&&s!==void 0?s:new Set;i.add(e),this.onInitCallbacks.set(r,i);const o=this.instances.get(r);return o&&e(o,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const s=this.onInitCallbacks.get(n);if(s)for(const r of s)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Xd(e),options:n}),this.instances.set(e,s),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=gt){return this.component?this.component.multipleInstances?e:gt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Xd(t){return t===gt?void 0:t}function Yd(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jd{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Qd(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var D;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(D||(D={}));const Zd={debug:D.DEBUG,verbose:D.VERBOSE,info:D.INFO,warn:D.WARN,error:D.ERROR,silent:D.SILENT},ef=D.INFO,tf={[D.DEBUG]:"log",[D.VERBOSE]:"log",[D.INFO]:"info",[D.WARN]:"warn",[D.ERROR]:"error"},nf=(t,e,...n)=>{if(e<t.logLevel)return;const s=new Date().toISOString(),r=tf[e];if(r)console[r](`[${s}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Yi{constructor(e){this.name=e,this._logLevel=ef,this._logHandler=nf,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in D))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Zd[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,D.DEBUG,...e),this._logHandler(this,D.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,D.VERBOSE,...e),this._logHandler(this,D.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,D.INFO,...e),this._logHandler(this,D.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,D.WARN,...e),this._logHandler(this,D.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,D.ERROR,...e),this._logHandler(this,D.ERROR,...e)}}const sf=(t,e)=>e.some(n=>t instanceof n);let wa,Ea;function rf(){return wa||(wa=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function of(){return Ea||(Ea=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const nu=new WeakMap,yi=new WeakMap,su=new WeakMap,Xr=new WeakMap,Ji=new WeakMap;function af(t){const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(ot(t.result)),r()},o=()=>{s(t.error),r()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&nu.set(n,t)}).catch(()=>{}),Ji.set(e,t),e}function cf(t){if(yi.has(t))return;const e=new Promise((n,s)=>{const r=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),r()},o=()=>{s(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});yi.set(t,e)}let vi={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return yi.get(t);if(e==="objectStoreNames")return t.objectStoreNames||su.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ot(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function uf(t){vi=t(vi)}function lf(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const s=t.call(Yr(this),e,...n);return su.set(s,e.sort?e.sort():[e]),ot(s)}:of().includes(t)?function(...e){return t.apply(Yr(this),e),ot(nu.get(this))}:function(...e){return ot(t.apply(Yr(this),e))}}function hf(t){return typeof t=="function"?lf(t):(t instanceof IDBTransaction&&cf(t),sf(t,rf())?new Proxy(t,vi):t)}function ot(t){if(t instanceof IDBRequest)return af(t);if(Xr.has(t))return Xr.get(t);const e=hf(t);return e!==t&&(Xr.set(t,e),Ji.set(e,t)),e}const Yr=t=>Ji.get(t);function df(t,e,{blocked:n,upgrade:s,blocking:r,terminated:i}={}){const o=indexedDB.open(t,e),a=ot(o);return s&&o.addEventListener("upgradeneeded",c=>{s(ot(o.result),c.oldVersion,c.newVersion,ot(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{i&&c.addEventListener("close",()=>i()),r&&c.addEventListener("versionchange",u=>r(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const ff=["get","getKey","getAll","getAllKeys","count"],pf=["put","add","delete","clear"],Jr=new Map;function Ta(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Jr.get(e))return Jr.get(e);const n=e.replace(/FromIndex$/,""),s=e!==n,r=pf.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(r||ff.includes(n)))return;const i=async function(o,...a){const c=this.transaction(o,r?"readwrite":"readonly");let u=c.store;return s&&(u=u.index(a.shift())),(await Promise.all([u[n](...a),r&&c.done]))[0]};return Jr.set(e,i),i}uf(t=>({...t,get:(e,n,s)=>Ta(e,n)||t.get(e,n,s),has:(e,n)=>!!Ta(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gf{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(mf(n)){const s=n.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(n=>n).join(" ")}}function mf(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const _i="@firebase/app",Ia="0.9.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const It=new Yi("@firebase/app"),yf="@firebase/app-compat",vf="@firebase/analytics-compat",_f="@firebase/analytics",wf="@firebase/app-check-compat",Ef="@firebase/app-check",Tf="@firebase/auth",If="@firebase/auth-compat",Sf="@firebase/database",bf="@firebase/database-compat",Af="@firebase/functions",Cf="@firebase/functions-compat",kf="@firebase/installations",Rf="@firebase/installations-compat",Nf="@firebase/messaging",Df="@firebase/messaging-compat",Of="@firebase/performance",Pf="@firebase/performance-compat",Mf="@firebase/remote-config",Lf="@firebase/remote-config-compat",xf="@firebase/storage",Uf="@firebase/storage-compat",Ff="@firebase/firestore",Vf="@firebase/firestore-compat",Bf="firebase",$f="9.23.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wi="[DEFAULT]",qf={[_i]:"fire-core",[yf]:"fire-core-compat",[_f]:"fire-analytics",[vf]:"fire-analytics-compat",[Ef]:"fire-app-check",[wf]:"fire-app-check-compat",[Tf]:"fire-auth",[If]:"fire-auth-compat",[Sf]:"fire-rtdb",[bf]:"fire-rtdb-compat",[Af]:"fire-fn",[Cf]:"fire-fn-compat",[kf]:"fire-iid",[Rf]:"fire-iid-compat",[Nf]:"fire-fcm",[Df]:"fire-fcm-compat",[Of]:"fire-perf",[Pf]:"fire-perf-compat",[Mf]:"fire-rc",[Lf]:"fire-rc-compat",[xf]:"fire-gcs",[Uf]:"fire-gcs-compat",[Ff]:"fire-fst",[Vf]:"fire-fst-compat","fire-js":"fire-js",[Bf]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vs=new Map,Ei=new Map;function jf(t,e){try{t.container.addComponent(e)}catch(n){It.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function St(t){const e=t.name;if(Ei.has(e))return It.debug(`There were multiple attempts to register component ${e}.`),!1;Ei.set(e,t);for(const n of Vs.values())jf(n,t);return!0}function ar(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zf={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."},at=new Wn("app","Firebase",zf);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(e,n,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new ct("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw at.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ot=$f;function Kf(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const s=Object.assign({name:wi,automaticDataCollectionEnabled:!1},e),r=s.name;if(typeof r!="string"||!r)throw at.create("bad-app-name",{appName:String(r)});if(n||(n=Zc()),!n)throw at.create("no-options");const i=Vs.get(r);if(i){if(Fs(n,i.options)&&Fs(s,i.config))return i;throw at.create("duplicate-app",{appName:r})}const o=new Jd(r);for(const c of Ei.values())o.addComponent(c);const a=new Hf(n,s,o);return Vs.set(r,a),a}function Zi(t=wi){const e=Vs.get(t);if(!e&&t===wi&&Zc())return Kf();if(!e)throw at.create("no-app",{appName:t});return e}function De(t,e,n){var s;let r=(s=qf[t])!==null&&s!==void 0?s:t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const a=[`Unable to register library "${r}" with version "${e}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),It.warn(a.join(" "));return}St(new ct(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gf="firebase-heartbeat-database",Wf=1,On="firebase-heartbeat-store";let Zr=null;function ru(){return Zr||(Zr=df(Gf,Wf,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(On)}}}).catch(t=>{throw at.create("idb-open",{originalErrorMessage:t.message})})),Zr}async function Qf(t){try{return await(await ru()).transaction(On).objectStore(On).get(iu(t))}catch(e){if(e instanceof Ue)It.warn(e.message);else{const n=at.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});It.warn(n.message)}}}async function Sa(t,e){try{const s=(await ru()).transaction(On,"readwrite");await s.objectStore(On).put(e,iu(t)),await s.done}catch(n){if(n instanceof Ue)It.warn(n.message);else{const s=at.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});It.warn(s.message)}}}function iu(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xf=1024,Yf=720*60*60*1e3;class Jf{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new ep(n),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ba();if(this._heartbeatsCache===null&&(this._heartbeatsCache=await this._heartbeatsCachePromise),!(this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(r=>r.date===s)))return this._heartbeatsCache.heartbeats.push({date:s,agent:n}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(r=>{const i=new Date(r.date).valueOf();return Date.now()-i<=Yf}),this._storage.overwrite(this._heartbeatsCache)}async getHeartbeatsHeader(){if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache===null||this._heartbeatsCache.heartbeats.length===0)return"";const e=ba(),{heartbeatsToSend:n,unsentEntries:s}=Zf(this._heartbeatsCache.heartbeats),r=Us(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}}function ba(){return new Date().toISOString().substring(0,10)}function Zf(t,e=Xf){const n=[];let s=t.slice();for(const r of t){const i=n.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),Aa(n)>e){i.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),Aa(n)>e){n.pop();break}s=s.slice(1)}return{heartbeatsToSend:n,unsentEntries:s}}class ep{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Bd()?$d().then(()=>!0).catch(()=>!1):!1}async read(){return await this._canUseIndexedDBPromise?await Qf(this.app)||{heartbeats:[]}:{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const r=await this.read();return Sa(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const r=await this.read();return Sa(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Aa(t){return Us(JSON.stringify({version:2,heartbeats:t})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tp(t){St(new ct("platform-logger",e=>new gf(e),"PRIVATE")),St(new ct("heartbeat",e=>new Jf(e),"PRIVATE")),De(_i,Ia,t),De(_i,Ia,"esm2017"),De("fire-js","")}tp("");function eo(t,e){var n={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&e.indexOf(s)<0&&(n[s]=t[s]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,s=Object.getOwnPropertySymbols(t);r<s.length;r++)e.indexOf(s[r])<0&&Object.prototype.propertyIsEnumerable.call(t,s[r])&&(n[s[r]]=t[s[r]]);return n}function ou(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const np=ou,au=new Wn("auth","Firebase",ou());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bs=new Yi("@firebase/auth");function sp(t,...e){Bs.logLevel<=D.WARN&&Bs.warn(`Auth (${Ot}): ${t}`,...e)}function Ns(t,...e){Bs.logLevel<=D.ERROR&&Bs.error(`Auth (${Ot}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Le(t,...e){throw to(t,...e)}function Oe(t,...e){return to(t,...e)}function cu(t,e,n){const s=Object.assign(Object.assign({},np()),{[e]:n});return new Wn("auth","Firebase",s).create(e,{appName:t.name})}function rp(t,e,n){const s=n;if(!(e instanceof s))throw s.name!==e.constructor.name&&Le(t,"argument-error"),cu(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function to(t,...e){if(typeof t!="string"){const n=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=t.name),t._errorFactory.create(n,...s)}return au.create(t,...e)}function A(t,e,...n){if(!t)throw to(e,...n)}function $e(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ns(e),new Error(e)}function Ge(t,e){t||$e(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ti(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function ip(){return Ca()==="http:"||Ca()==="https:"}function Ca(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function op(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ip()||Ud()||"connection"in navigator)?navigator.onLine:!0}function ap(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(e,n){this.shortDelay=e,this.longDelay=n,Ge(n>e,"Short delay should be less than long delay!"),this.isMobile=Ld()||Fd()}get(){return op()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function no(t,e){Ge(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uu{static initialize(e,n,s){this.fetchImpl=e,n&&(this.headersImpl=n),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;$e("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;$e("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;$e("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cp={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const up=new Xn(3e4,6e4);function lu(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Yn(t,e,n,s,r={}){return hu(t,r,async()=>{let i={},o={};s&&(e==="GET"?o=s:i={body:JSON.stringify(s)});const a=Qn(Object.assign({key:t.config.apiKey},o)).slice(1),c=await t._getAdditionalHeaders();return c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode),uu.fetch()(du(t,t.config.apiHost,n,a),Object.assign({method:e,headers:c,referrerPolicy:"no-referrer"},i))})}async function hu(t,e,n){t._canInitEmulator=!1;const s=Object.assign(Object.assign({},cp),e);try{const r=new hp(t),i=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw vs(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw vs(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw vs(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw vs(t,"user-disabled",o);const l=s[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw cu(t,l,u);Le(t,l)}}catch(r){if(r instanceof Ue)throw r;Le(t,"network-request-failed",{message:String(r)})}}async function lp(t,e,n,s,r={}){const i=await Yn(t,e,n,s,r);return"mfaPendingCredential"in i&&Le(t,"multi-factor-auth-required",{_serverResponse:i}),i}function du(t,e,n,s){const r=`${e}${n}?${s}`;return t.config.emulator?no(t.config,r):`${t.config.apiScheme}://${r}`}class hp{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,s)=>{this.timer=setTimeout(()=>s(Oe(this.auth,"network-request-failed")),up.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function vs(t,e,n){const s={appName:t.name};n.email&&(s.email=n.email),n.phoneNumber&&(s.phoneNumber=n.phoneNumber);const r=Oe(t,e,s);return r.customData._tokenResponse=n,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dp(t,e){return Yn(t,"POST","/v1/accounts:delete",e)}async function fp(t,e){return Yn(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bn(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function pp(t,e=!1){const n=U(t),s=await n.getIdToken(e),r=so(s);A(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");const i=typeof r.firebase=="object"?r.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:r,token:s,authTime:bn(ei(r.auth_time)),issuedAtTime:bn(ei(r.iat)),expirationTime:bn(ei(r.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function ei(t){return Number(t)*1e3}function so(t){const[e,n,s]=t.split(".");if(e===void 0||n===void 0||s===void 0)return Ns("JWT malformed, contained fewer than 3 sections"),null;try{const r=Xc(n);return r?JSON.parse(r):(Ns("Failed to decode base64 JWT payload"),null)}catch(r){return Ns("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function gp(t){const e=so(t);return A(e,"internal-error"),A(typeof e.exp<"u","internal-error"),A(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pn(t,e,n=!1){if(n)return e;try{return await e}catch(s){throw s instanceof Ue&&mp(s)&&t.auth.currentUser===t&&await t.auth.signOut(),s}}function mp({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yp{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const s=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),s}else{this.errorBackoff=3e4;const r=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fu{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=bn(this.lastLoginAt),this.creationTime=bn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $s(t){var e;const n=t.auth,s=await t.getIdToken(),r=await Pn(t,fp(n,{idToken:s}));A(r==null?void 0:r.users.length,n,"internal-error");const i=r.users[0];t._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?wp(i.providerUserInfo):[],a=_p(t.providerData,o),c=t.isAnonymous,u=!(t.email&&i.passwordHash)&&!(a!=null&&a.length),l=c?u:!1,h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new fu(i.createdAt,i.lastLoginAt),isAnonymous:l};Object.assign(t,h)}async function vp(t){const e=U(t);await $s(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function _p(t,e){return[...t.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function wp(t){return t.map(e=>{var{providerId:n}=e,s=eo(e,["providerId"]);return{providerId:n,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ep(t,e){const n=await hu(t,{},async()=>{const s=Qn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=t.config,o=du(t,r,"/v1/token",`key=${i}`),a=await t._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",uu.fetch()(o,{method:"POST",headers:a,body:s})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){A(e.idToken,"internal-error"),A(typeof e.idToken<"u","internal-error"),A(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):gp(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}async getToken(e,n=!1){return A(!this.accessToken||this.refreshToken,e,"user-token-expired"),!n&&this.accessToken&&!this.isExpired?this.accessToken:this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:s,refreshToken:r,expiresIn:i}=await Ep(e,n);this.updateTokensAndExpiration(s,r,Number(i))}updateTokensAndExpiration(e,n,s){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,n){const{refreshToken:s,accessToken:r,expirationTime:i}=n,o=new Mn;return s&&(A(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),r&&(A(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),i&&(A(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Mn,this.toJSON())}_performRefresh(){return $e("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(t,e){A(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class wt{constructor(e){var{uid:n,auth:s,stsTokenManager:r}=e,i=eo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new yp(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=s,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new fu(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Pn(this,this.stsTokenManager.getToken(this.auth,e));return A(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return pp(this,e)}reload(){return vp(this)}_assign(e){this!==e&&(A(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new wt(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){A(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),n&&await $s(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){const e=await this.getIdToken();return await Pn(this,dp(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var s,r,i,o,a,c,u,l;const h=(s=n.displayName)!==null&&s!==void 0?s:void 0,d=(r=n.email)!==null&&r!==void 0?r:void 0,p=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,y=(o=n.photoURL)!==null&&o!==void 0?o:void 0,w=(a=n.tenantId)!==null&&a!==void 0?a:void 0,_=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,O=(u=n.createdAt)!==null&&u!==void 0?u:void 0,P=(l=n.lastLoginAt)!==null&&l!==void 0?l:void 0,{uid:R,emailVerified:M,isAnonymous:ge,providerData:me,stsTokenManager:Fe}=n;A(R&&Fe,e,"internal-error");const Ve=Mn.fromJSON(this.name,Fe);A(typeof R=="string",e,"internal-error"),Ze(h,e.name),Ze(d,e.name),A(typeof M=="boolean",e,"internal-error"),A(typeof ge=="boolean",e,"internal-error"),Ze(p,e.name),Ze(y,e.name),Ze(w,e.name),Ze(_,e.name),Ze(O,e.name),Ze(P,e.name);const Ae=new wt({uid:R,auth:e,email:d,emailVerified:M,displayName:h,isAnonymous:ge,photoURL:y,phoneNumber:p,tenantId:w,stsTokenManager:Ve,createdAt:O,lastLoginAt:P});return me&&Array.isArray(me)&&(Ae.providerData=me.map(Ad=>Object.assign({},Ad))),_&&(Ae._redirectEventId=_),Ae}static async _fromIdTokenResponse(e,n,s=!1){const r=new Mn;r.updateFromServerResponse(n);const i=new wt({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await $s(i),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ka=new Map;function qe(t){Ge(t instanceof Function,"Expected a class definition");let e=ka.get(t);return e?(Ge(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,ka.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}pu.type="NONE";const Ra=pu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ds(t,e,n){return`firebase:${t}:${e}:${n}`}class jt{constructor(e,n,s){this.persistence=e,this.auth=n,this.userKey=s;const{config:r,name:i}=this.auth;this.fullUserKey=Ds(this.userKey,r.apiKey,i),this.fullPersistenceKey=Ds("persistence",r.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?wt._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,s="authUser"){if(!n.length)return new jt(qe(Ra),e,s);const r=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=r[0]||qe(Ra);const o=Ds(s,e.config.apiKey,e.name);let a=null;for(const u of n)try{const l=await u._get(o);if(l){const h=wt._fromJSON(e,l);u!==i&&(a=h),i=u;break}}catch{}const c=r.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new jt(i,e,s):(i=c[0],a&&await i._set(o,a.toJSON()),await Promise.all(n.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new jt(i,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Na(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(yu(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(gu(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(_u(e))return"Blackberry";if(wu(e))return"Webos";if(ro(e))return"Safari";if((e.includes("chrome/")||mu(e))&&!e.includes("edge/"))return"Chrome";if(vu(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=t.match(n);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function gu(t=le()){return/firefox\//i.test(t)}function ro(t=le()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function mu(t=le()){return/crios\//i.test(t)}function yu(t=le()){return/iemobile/i.test(t)}function vu(t=le()){return/android/i.test(t)}function _u(t=le()){return/blackberry/i.test(t)}function wu(t=le()){return/webos/i.test(t)}function cr(t=le()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Tp(t=le()){var e;return cr(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Ip(){return Vd()&&document.documentMode===10}function Eu(t=le()){return cr(t)||vu(t)||wu(t)||_u(t)||/windows phone/i.test(t)||yu(t)}function Sp(){try{return!!(window&&window!==window.top)}catch{return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tu(t,e=[]){let n;switch(t){case"Browser":n=Na(le());break;case"Worker":n=`${Na(le())}-${t}`;break;default:n=t}const s=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ot}/${s}`}async function Iu(t,e){return Yn(t,"GET","/v2/recaptchaConfig",lu(t,e))}function Da(t){return t!==void 0&&t.enterprise!==void 0}class Su{constructor(e){if(this.siteKey="",this.emailPasswordEnabled=!1,e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.emailPasswordEnabled=e.recaptchaEnforcementState.some(n=>n.provider==="EMAIL_PASSWORD_PROVIDER"&&n.enforcementState!=="OFF")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bp(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}function bu(t){return new Promise((e,n)=>{const s=document.createElement("script");s.setAttribute("src",t),s.onload=e,s.onerror=r=>{const i=Oe("internal-error");i.customData=r,n(i)},s.type="text/javascript",s.charset="UTF-8",bp().appendChild(s)})}function Ap(t){return`__${t}${Math.floor(Math.random()*1e6)}`}const Cp="https://www.google.com/recaptcha/enterprise.js?render=",kp="recaptcha-enterprise",Rp="NO_RECAPTCHA";class Np{constructor(e){this.type=kp,this.auth=Jn(e)}async verify(e="verify",n=!1){async function s(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{Iu(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new Su(c);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(c=>{a(c)})})}function r(i,o,a){const c=window.grecaptcha;Da(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(Rp)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((i,o)=>{s(this.auth).then(a=>{if(!n&&Da(window.grecaptcha))r(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}bu(Cp+a).then(()=>{r(a,i,o)}).catch(c=>{o(c)})}}).catch(a=>{o(a)})})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dp{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const s=i=>new Promise((o,a)=>{try{const c=e(i);o(c)}catch(c){a(c)}});s.onAbort=n,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const s of this.queue)await s(e),s.onAbort&&n.push(s.onAbort)}catch(s){n.reverse();for(const r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(e,n,s,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Oa(this),this.idTokenSubscription=new Oa(this),this.beforeStateQueue=new Dp(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=au,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=qe(n)),this._initializationPromise=this.queue(async()=>{var s,r;if(!this._deleted&&(this.persistenceManager=await jt.create(this,e),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((r=this.currentUser)===null||r===void 0?void 0:r.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUser(e){var n;const s=await this.assertedPersistence.getCurrentUser();let r=s,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,a=r==null?void 0:r._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(r=c.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return A(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await $s(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=ap()}async _delete(){this._deleted=!0}async updateCurrentUser(e){const n=e?U(e):null;return n&&A(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&A(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0)}setPersistence(e){return this.queue(async()=>{await this.assertedPersistence.setPersistence(qe(e))})}async initializeRecaptchaConfig(){const e=await Iu(this,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new Su(e);this.tenantId==null?this._agentRecaptchaConfig=n:this._tenantRecaptchaConfigs[this.tenantId]=n,n.emailPasswordEnabled&&new Np(this).verify()}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Wn("auth","Firebase",e())}onAuthStateChanged(e,n,s){return this.registerStateListener(this.authStateSubscription,e,n,s)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,s){return this.registerStateListener(this.idTokenSubscription,e,n,s)}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const s=await this.getOrInitRedirectPersistenceManager(n);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&qe(e)||this._popupRedirectResolver;A(n,this,"argument-error"),this.redirectPersistenceManager=await jt.create(this,[qe(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,s;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((s=this.redirectUser)===null||s===void 0?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,s,r){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n),o=this._isInitialized?Promise.resolve():this._initializationPromise;return A(o,this,"internal-error"),o.then(()=>i(this.currentUser)),typeof n=="function"?e.addObserver(n,s,r):e.addObserver(n)}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return A(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Tu(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const s=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());s&&(n["X-Firebase-Client"]=s);const r=await this._getAppCheckToken();return r&&(n["X-Firebase-AppCheck"]=r),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&sp(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Jn(t){return U(t)}class Oa{constructor(e){this.auth=e,this.observer=null,this.addObserver=Kd(n=>this.observer=n)}get next(){return A(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pp(t,e){const n=ar(t,"auth");if(n.isInitialized()){const r=n.getImmediate(),i=n.getOptions();if(Fs(i,e??{}))return r;Le(r,"already-initialized")}return n.initialize({options:e})}function Mp(t,e){const n=(e==null?void 0:e.persistence)||[],s=(Array.isArray(n)?n:[n]).map(qe);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function Lp(t,e,n){const s=Jn(t);A(s._canInitEmulator,s,"emulator-config-failed"),A(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,i=Au(e),{host:o,port:a}=xp(e),c=a===null?"":`:${a}`;s.config.emulator={url:`${i}//${o}${c}/`},s.settings.appVerificationDisabledForTesting=!0,s.emulatorConfig=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})}),Up()}function Au(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function xp(t){const e=Au(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const s=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const i=r[1];return{host:i,port:Pa(s.substr(i.length+1))}}else{const[i,o]=s.split(":");return{host:i,port:Pa(o)}}}function Pa(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Up(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cu{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return $e("not implemented")}_getIdTokenResponse(e){return $e("not implemented")}_linkToIdToken(e,n){return $e("not implemented")}_getReauthenticationResolver(e){return $e("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zt(t,e){return lp(t,"POST","/v1/accounts:signInWithIdp",lu(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fp="http://localhost";class bt extends Cu{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new bt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Le("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r}=n,i=eo(n,["providerId","signInMethod"]);if(!s||!r)return null;const o=new bt(s,r);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return zt(e,n)}_linkToIdToken(e,n){const s=this.buildRequest();return s.idToken=n,zt(e,s)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,zt(e,n)}buildRequest(){const e={requestUri:Fp,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Qn(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn extends io{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et extends Zn{constructor(){super("facebook.com")}static credential(e){return bt._fromParams({providerId:et.PROVIDER_ID,signInMethod:et.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return et.credentialFromTaggedObject(e)}static credentialFromError(e){return et.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return et.credential(e.oauthAccessToken)}catch{return null}}}et.FACEBOOK_SIGN_IN_METHOD="facebook.com";et.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt extends Zn{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return bt._fromParams({providerId:tt.PROVIDER_ID,signInMethod:tt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return tt.credentialFromTaggedObject(e)}static credentialFromError(e){return tt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:s}=e;if(!n&&!s)return null;try{return tt.credential(n,s)}catch{return null}}}tt.GOOGLE_SIGN_IN_METHOD="google.com";tt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt extends Zn{constructor(){super("github.com")}static credential(e){return bt._fromParams({providerId:nt.PROVIDER_ID,signInMethod:nt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return nt.credentialFromTaggedObject(e)}static credentialFromError(e){return nt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return nt.credential(e.oauthAccessToken)}catch{return null}}}nt.GITHUB_SIGN_IN_METHOD="github.com";nt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st extends Zn{constructor(){super("twitter.com")}static credential(e,n){return bt._fromParams({providerId:st.PROVIDER_ID,signInMethod:st.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return st.credentialFromTaggedObject(e)}static credentialFromError(e){return st.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:s}=e;if(!n||!s)return null;try{return st.credential(n,s)}catch{return null}}}st.TWITTER_SIGN_IN_METHOD="twitter.com";st.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,s,r=!1){const i=await wt._fromIdTokenResponse(e,s,r),o=Ma(s);return new Xt({user:i,providerId:o,_tokenResponse:s,operationType:n})}static async _forOperation(e,n,s){await e._updateTokensIfNecessary(s,!0);const r=Ma(s);return new Xt({user:e,providerId:r,_tokenResponse:s,operationType:n})}}function Ma(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qs extends Ue{constructor(e,n,s,r){var i;super(n.code,n.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,qs.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,n,s,r){return new qs(e,n,s,r)}}function ku(t,e,n,s){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?qs._fromErrorAndOperation(t,i,e,s):i})}async function Vp(t,e,n=!1){const s=await Pn(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Xt._forOperation(t,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bp(t,e,n=!1){const{auth:s}=t,r="reauthenticate";try{const i=await Pn(t,ku(s,r,e,t),n);A(i.idToken,s,"internal-error");const o=so(i.idToken);A(o,s,"internal-error");const{sub:a}=o;return A(t.uid===a,s,"user-mismatch"),Xt._forOperation(t,r,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Le(s,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $p(t,e,n=!1){const s="signIn",r=await ku(t,s,e),i=await Xt._fromIdTokenResponse(t,s,r);return n||await t._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IE(t,e){return U(t).setPersistence(e)}function qp(t,e,n,s){return U(t).onIdTokenChanged(e,n,s)}function jp(t,e,n){return U(t).beforeAuthStateChanged(e,n)}function SE(t,e,n,s){return U(t).onAuthStateChanged(e,n,s)}function bE(t){return U(t).signOut()}const js="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ru{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(js,"1"),this.storage.removeItem(js),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zp(){const t=le();return ro(t)||cr(t)}const Hp=1e3,Kp=10;class Nu extends Ru{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.safariLocalStorageNotSynced=zp()&&Sp(),this.fallbackToPolling=Eu(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const s=this.storage.getItem(n),r=this.localCache[n];s!==r&&e(n,r,s)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const s=e.key;if(n?this.detachListener():this.stopPolling(),this.safariLocalStorageNotSynced){const o=this.storage.getItem(s);if(e.newValue!==o)e.newValue!==null?this.storage.setItem(s,e.newValue):this.storage.removeItem(s);else if(this.localCache[s]===e.newValue&&!n)return}const r=()=>{const o=this.storage.getItem(s);!n&&this.localCache[s]===o||this.notifyListeners(s,o)},i=this.storage.getItem(s);Ip()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,Kp):r()}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:s}),!0)})},Hp)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Nu.type="LOCAL";const Gp=Nu;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Du extends Ru{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Du.type="SESSION";const Ou=Du;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wp(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;const s=new ur(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:s,eventType:r,data:i}=n.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const a=Array.from(o).map(async u=>u(n.origin,i)),c=await Wp(a);n.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ur.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oo(t="",e=10){let n="";for(let s=0;s<e;s++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qp{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,o;return new Promise((a,c)=>{const u=oo("",20);r.port1.start();const l=setTimeout(()=>{c(new Error("unsupported_event"))},s);o={messageChannel:r,onMessage(h){const d=h;if(d.data.eventId===u)switch(d.data.status){case"ack":clearTimeout(l),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(d.data.response);break;default:clearTimeout(l),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:n},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pe(){return window}function Xp(t){Pe().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pu(){return typeof Pe().WorkerGlobalScope<"u"&&typeof Pe().importScripts=="function"}async function Yp(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Jp(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function Zp(){return Pu()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mu="firebaseLocalStorageDb",eg=1,zs="firebaseLocalStorage",Lu="fbase_key";class es{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function lr(t,e){return t.transaction([zs],e?"readwrite":"readonly").objectStore(zs)}function tg(){const t=indexedDB.deleteDatabase(Mu);return new es(t).toPromise()}function Ii(){const t=indexedDB.open(Mu,eg);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const s=t.result;try{s.createObjectStore(zs,{keyPath:Lu})}catch(r){n(r)}}),t.addEventListener("success",async()=>{const s=t.result;s.objectStoreNames.contains(zs)?e(s):(s.close(),await tg(),e(await Ii()))})})}async function La(t,e,n){const s=lr(t,!0).put({[Lu]:e,value:n});return new es(s).toPromise()}async function ng(t,e){const n=lr(t,!1).get(e),s=await new es(n).toPromise();return s===void 0?null:s.value}function xa(t,e){const n=lr(t,!0).delete(e);return new es(n).toPromise()}const sg=800,rg=3;class xu{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ii(),this.db)}async _withRetries(e){let n=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(n++>rg)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Pu()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ur._getInstance(Zp()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await Yp(),!this.activeServiceWorker)return;this.sender=new Qp(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&!((e=s[0])===null||e===void 0)&&e.fulfilled&&!((n=s[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Jp()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ii();return await La(e,js,"1"),await xa(e,js),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(s=>La(s,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(s=>ng(s,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>xa(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const i=lr(r,!1).getAll();return new es(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],s=new Set;for(const{fbase_key:r,value:i}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),n.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),sg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}xu.type="LOCAL";const ig=xu;new Xn(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uu(t,e){return e?qe(e):(A(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao extends Cu{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return zt(e,this._buildIdpRequest())}_linkToIdToken(e,n){return zt(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return zt(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function og(t){return $p(t.auth,new ao(t),t.bypassAuthState)}function ag(t){const{auth:e,user:n}=t;return A(n,e,"internal-error"),Bp(n,new ao(t),t.bypassAuthState)}async function cg(t){const{auth:e,user:n}=t;return A(n,e,"internal-error"),Vp(n,new ao(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fu{constructor(e,n,s,r,i=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:s,postBody:r,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:s,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return og;case"linkViaPopup":case"linkViaRedirect":return cg;case"reauthViaPopup":case"reauthViaRedirect":return ag;default:Le(this.auth,"internal-error")}}resolve(e){Ge(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ge(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ug=new Xn(2e3,1e4);async function AE(t,e,n){const s=Jn(t);rp(t,e,io);const r=Uu(s,n);return new mt(s,"signInViaPopup",e,r).executeNotNull()}class mt extends Fu{constructor(e,n,s,r,i){super(e,n,r,i),this.provider=s,this.authWindow=null,this.pollId=null,mt.currentPopupAction&&mt.currentPopupAction.cancel(),mt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return A(e,this.auth,"internal-error"),e}async onExecution(){Ge(this.filter.length===1,"Popup operations only handle one event");const e=oo();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Oe(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Oe(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,mt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,s;if(!((s=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||s===void 0)&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Oe(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ug.get())};e()}}mt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lg="pendingRedirect",Os=new Map;class hg extends Fu{constructor(e,n,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,s),this.eventId=null}async execute(){let e=Os.get(this.auth._key());if(!e){try{const s=await dg(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(n){e=()=>Promise.reject(n)}Os.set(this.auth._key(),e)}return this.bypassAuthState||Os.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function dg(t,e){const n=gg(e),s=pg(t);if(!await s._isAvailable())return!1;const r=await s._get(n)==="true";return await s._remove(n),r}function fg(t,e){Os.set(t._key(),e)}function pg(t){return qe(t._redirectPersistence)}function gg(t){return Ds(lg,t.config.apiKey,t.name)}async function mg(t,e,n=!1){const s=Jn(t),r=Uu(s,e),o=await new hg(s,r,n).execute();return o&&!n&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yg=600*1e3;class vg{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(n=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!_g(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var s;if(e.error&&!Vu(e)){const r=((s=e.error.code)===null||s===void 0?void 0:s.split("auth/")[1])||"internal-error";n.onError(Oe(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const s=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=yg&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ua(e))}saveEventToCache(e){this.cachedEventUids.add(Ua(e)),this.lastProcessedEventTime=Date.now()}}function Ua(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Vu({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function _g(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Vu(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wg(t,e={}){return Yn(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eg=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Tg=/^https?/;async function Ig(t){if(t.config.emulator)return;const{authorizedDomains:e}=await wg(t);for(const n of e)try{if(Sg(n))return}catch{}Le(t,"unauthorized-domain")}function Sg(t){const e=Ti(),{protocol:n,hostname:s}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&s===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===s}if(!Tg.test(n))return!1;if(Eg.test(t))return s===t;const r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bg=new Xn(3e4,6e4);function Fa(){const t=Pe().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Ag(t){return new Promise((e,n)=>{var s,r,i;function o(){Fa(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Fa(),n(Oe(t,"network-request-failed"))},timeout:bg.get()})}if(!((r=(s=Pe().gapi)===null||s===void 0?void 0:s.iframes)===null||r===void 0)&&r.Iframe)e(gapi.iframes.getContext());else if(!((i=Pe().gapi)===null||i===void 0)&&i.load)o();else{const a=Ap("iframefcb");return Pe()[a]=()=>{gapi.load?o():n(Oe(t,"network-request-failed"))},bu(`https://apis.google.com/js/api.js?onload=${a}`).catch(c=>n(c))}}).catch(e=>{throw Ps=null,e})}let Ps=null;function Cg(t){return Ps=Ps||Ag(t),Ps}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kg=new Xn(5e3,15e3),Rg="__/auth/iframe",Ng="emulator/auth/iframe",Dg={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Og=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Pg(t){const e=t.config;A(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?no(e,Ng):`https://${t.config.authDomain}/${Rg}`,s={apiKey:e.apiKey,appName:t.name,v:Ot},r=Og.get(t.config.apiHost);r&&(s.eid=r);const i=t._getFrameworks();return i.length&&(s.fw=i.join(",")),`${n}?${Qn(s).slice(1)}`}async function Mg(t){const e=await Cg(t),n=Pe().gapi;return A(n,t,"internal-error"),e.open({where:document.body,url:Pg(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Dg,dontclear:!0},s=>new Promise(async(r,i)=>{await s.restyle({setHideOnLeave:!1});const o=Oe(t,"network-request-failed"),a=Pe().setTimeout(()=>{i(o)},kg.get());function c(){Pe().clearTimeout(a),r(s)}s.ping(c).then(c,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lg={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},xg=500,Ug=600,Fg="_blank",Vg="http://localhost";class Va{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Bg(t,e,n,s=xg,r=Ug){const i=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let a="";const c=Object.assign(Object.assign({},Lg),{width:s.toString(),height:r.toString(),top:i,left:o}),u=le().toLowerCase();n&&(a=mu(u)?Fg:n),gu(u)&&(e=e||Vg,c.scrollbars="yes");const l=Object.entries(c).reduce((d,[p,y])=>`${d}${p}=${y},`,"");if(Tp(u)&&a!=="_self")return $g(e||"",a),new Va(null);const h=window.open(e||"",a,l);A(h,t,"popup-blocked");try{h.focus()}catch{}return new Va(h)}function $g(t,e){const n=document.createElement("a");n.href=t,n.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qg="__/auth/handler",jg="emulator/auth/handler",zg=encodeURIComponent("fac");async function Ba(t,e,n,s,r,i){A(t.config.authDomain,t,"auth-domain-config-required"),A(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:s,v:Ot,eventId:r};if(e instanceof io){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Hd(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[l,h]of Object.entries({}))o[l]=h}if(e instanceof Zn){const l=e.getScopes().filter(h=>h!=="");l.length>0&&(o.scopes=l.join(","))}t.tenantId&&(o.tid=t.tenantId);const a=o;for(const l of Object.keys(a))a[l]===void 0&&delete a[l];const c=await t._getAppCheckToken(),u=c?`#${zg}=${encodeURIComponent(c)}`:"";return`${Hg(t)}?${Qn(a).slice(1)}${u}`}function Hg({config:t}){return t.emulator?no(t,jg):`https://${t.authDomain}/${qg}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ti="webStorageSupport";class Kg{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ou,this._completeRedirectFn=mg,this._overrideRedirectResult=fg}async _openPopup(e,n,s,r){var i;Ge((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await Ba(e,n,s,Ti(),r);return Bg(e,o,oo())}async _openRedirect(e,n,s,r){await this._originValidation(e);const i=await Ba(e,n,s,Ti(),r);return Xp(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:r,promise:i}=this.eventManagers[n];return r?Promise.resolve(r):(Ge(i,"If manager is not set, promise should be"),i)}const s=this.initAndGetManager(e);return this.eventManagers[n]={promise:s},s.catch(()=>{delete this.eventManagers[n]}),s}async initAndGetManager(e){const n=await Mg(e),s=new vg(e);return n.register("authEvent",r=>(A(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=n,s}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(ti,{type:ti},r=>{var i;const o=(i=r==null?void 0:r[0])===null||i===void 0?void 0:i[ti];o!==void 0&&n(!!o),Le(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Ig(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Eu()||ro()||cr()}}const Gg=Kg;var $a="@firebase/auth",qa="0.23.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wg{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){A(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";default:return}}function Xg(t){St(new ct("auth",(e,{options:n})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=s.options;A(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const c={apiKey:o,authDomain:a,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Tu(t)},u=new Op(s,r,i,c);return Mp(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,s)=>{e.getProvider("auth-internal").initialize()})),St(new ct("auth-internal",e=>{const n=Jn(e.getProvider("auth").getImmediate());return(s=>new Wg(s))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),De($a,qa,Qg(t)),De($a,qa,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yg=300,Jg=eu("authIdTokenMaxAge")||Yg;let ja=null;const Zg=t=>async e=>{const n=e&&await e.getIdTokenResult(),s=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(s&&s>Jg)return;const r=n==null?void 0:n.token;ja!==r&&(ja=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function CE(t=Zi()){const e=ar(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Pp(t,{popupRedirectResolver:Gg,persistence:[ig,Gp,Ou]}),s=eu("authTokenSyncURL");if(s){const i=Zg(s);jp(n,i,()=>i(n.currentUser)),qp(n,o=>i(o))}const r=Yc("auth");return r&&Lp(n,`http://${r}`),n}Xg("Browser");var em=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},m,co=co||{},S=em||self;function hr(t){var e=typeof t;return e=e!="object"?e:t?Array.isArray(t)?"array":e:"null",e=="array"||e=="object"&&typeof t.length=="number"}function dr(t){var e=typeof t;return e=="object"&&t!=null||e=="function"}function tm(t,e,n){return t.call.apply(t.bind,arguments)}function nm(t,e,n){if(!t)throw Error();if(2<arguments.length){var s=Array.prototype.slice.call(arguments,2);return function(){var r=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(r,s),t.apply(e,r)}}return function(){return t.apply(e,arguments)}}function oe(t,e,n){return Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?oe=tm:oe=nm,oe.apply(null,arguments)}function _s(t,e){var n=Array.prototype.slice.call(arguments,1);return function(){var s=n.slice();return s.push.apply(s,arguments),t.apply(this,s)}}function Y(t,e){function n(){}n.prototype=e.prototype,t.$=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.ac=function(s,r,i){for(var o=Array(arguments.length-2),a=2;a<arguments.length;a++)o[a-2]=arguments[a];return e.prototype[r].apply(s,o)}}function dt(){this.s=this.s,this.o=this.o}var sm=0;dt.prototype.s=!1;dt.prototype.sa=function(){!this.s&&(this.s=!0,this.N(),sm!=0)};dt.prototype.N=function(){if(this.o)for(;this.o.length;)this.o.shift()()};const Bu=Array.prototype.indexOf?function(t,e){return Array.prototype.indexOf.call(t,e,void 0)}:function(t,e){if(typeof t=="string")return typeof e!="string"||e.length!=1?-1:t.indexOf(e,0);for(let n=0;n<t.length;n++)if(n in t&&t[n]===e)return n;return-1};function uo(t){const e=t.length;if(0<e){const n=Array(e);for(let s=0;s<e;s++)n[s]=t[s];return n}return[]}function za(t,e){for(let n=1;n<arguments.length;n++){const s=arguments[n];if(hr(s)){const r=t.length||0,i=s.length||0;t.length=r+i;for(let o=0;o<i;o++)t[r+o]=s[o]}else t.push(s)}}function ae(t,e){this.type=t,this.g=this.target=e,this.defaultPrevented=!1}ae.prototype.h=function(){this.defaultPrevented=!0};var rm=function(){if(!S.addEventListener||!Object.defineProperty)return!1;var t=!1,e=Object.defineProperty({},"passive",{get:function(){t=!0}});try{S.addEventListener("test",()=>{},e),S.removeEventListener("test",()=>{},e)}catch{}return t}();function Ln(t){return/^[\s\xa0]*$/.test(t)}function fr(){var t=S.navigator;return t&&(t=t.userAgent)?t:""}function Ce(t){return fr().indexOf(t)!=-1}function lo(t){return lo[" "](t),t}lo[" "]=function(){};function im(t,e){var n=Jm;return Object.prototype.hasOwnProperty.call(n,t)?n[t]:n[t]=e(t)}var om=Ce("Opera"),Yt=Ce("Trident")||Ce("MSIE"),$u=Ce("Edge"),Si=$u||Yt,qu=Ce("Gecko")&&!(fr().toLowerCase().indexOf("webkit")!=-1&&!Ce("Edge"))&&!(Ce("Trident")||Ce("MSIE"))&&!Ce("Edge"),am=fr().toLowerCase().indexOf("webkit")!=-1&&!Ce("Edge");function ju(){var t=S.document;return t?t.documentMode:void 0}var bi;e:{var ni="",si=function(){var t=fr();if(qu)return/rv:([^\);]+)(\)|;)/.exec(t);if($u)return/Edge\/([\d\.]+)/.exec(t);if(Yt)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(t);if(am)return/WebKit\/(\S+)/.exec(t);if(om)return/(?:Version)[ \/]?(\S+)/.exec(t)}();if(si&&(ni=si?si[1]:""),Yt){var ri=ju();if(ri!=null&&ri>parseFloat(ni)){bi=String(ri);break e}}bi=ni}var Ai;if(S.document&&Yt){var Ha=ju();Ai=Ha||parseInt(bi,10)||void 0}else Ai=void 0;var cm=Ai;function xn(t,e){if(ae.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var n=this.type=t.type,s=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=e,e=t.relatedTarget){if(qu){e:{try{lo(e.nodeName);var r=!0;break e}catch{}r=!1}r||(e=null)}}else n=="mouseover"?e=t.fromElement:n=="mouseout"&&(e=t.toElement);this.relatedTarget=e,s?(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=typeof t.pointerType=="string"?t.pointerType:um[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&xn.$.h.call(this)}}Y(xn,ae);var um={2:"touch",3:"pen",4:"mouse"};xn.prototype.h=function(){xn.$.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var pr="closure_listenable_"+(1e6*Math.random()|0),lm=0;function hm(t,e,n,s,r){this.listener=t,this.proxy=null,this.src=e,this.type=n,this.capture=!!s,this.la=r,this.key=++lm,this.fa=this.ia=!1}function gr(t){t.fa=!0,t.listener=null,t.proxy=null,t.src=null,t.la=null}function ho(t,e,n){for(const s in t)e.call(n,t[s],s,t)}function dm(t,e){for(const n in t)e.call(void 0,t[n],n,t)}function zu(t){const e={};for(const n in t)e[n]=t[n];return e}const Ka="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Hu(t,e){let n,s;for(let r=1;r<arguments.length;r++){s=arguments[r];for(n in s)t[n]=s[n];for(let i=0;i<Ka.length;i++)n=Ka[i],Object.prototype.hasOwnProperty.call(s,n)&&(t[n]=s[n])}}function mr(t){this.src=t,this.g={},this.h=0}mr.prototype.add=function(t,e,n,s,r){var i=t.toString();t=this.g[i],t||(t=this.g[i]=[],this.h++);var o=ki(t,e,s,r);return-1<o?(e=t[o],n||(e.ia=!1)):(e=new hm(e,this.src,i,!!s,r),e.ia=n,t.push(e)),e};function Ci(t,e){var n=e.type;if(n in t.g){var s=t.g[n],r=Bu(s,e),i;(i=0<=r)&&Array.prototype.splice.call(s,r,1),i&&(gr(e),t.g[n].length==0&&(delete t.g[n],t.h--))}}function ki(t,e,n,s){for(var r=0;r<t.length;++r){var i=t[r];if(!i.fa&&i.listener==e&&i.capture==!!n&&i.la==s)return r}return-1}var fo="closure_lm_"+(1e6*Math.random()|0),ii={};function Ku(t,e,n,s,r){if(Array.isArray(e)){for(var i=0;i<e.length;i++)Ku(t,e[i],n,s,r);return null}return n=Qu(n),t&&t[pr]?t.O(e,n,dr(s)?!!s.capture:!1,r):fm(t,e,n,!1,s,r)}function fm(t,e,n,s,r,i){if(!e)throw Error("Invalid event type");var o=dr(r)?!!r.capture:!!r,a=go(t);if(a||(t[fo]=a=new mr(t)),n=a.add(e,n,s,o,i),n.proxy)return n;if(s=pm(),n.proxy=s,s.src=t,s.listener=n,t.addEventListener)rm||(r=o),r===void 0&&(r=!1),t.addEventListener(e.toString(),s,r);else if(t.attachEvent)t.attachEvent(Wu(e.toString()),s);else if(t.addListener&&t.removeListener)t.addListener(s);else throw Error("addEventListener and attachEvent are unavailable.");return n}function pm(){function t(n){return e.call(t.src,t.listener,n)}const e=gm;return t}function Gu(t,e,n,s,r){if(Array.isArray(e))for(var i=0;i<e.length;i++)Gu(t,e[i],n,s,r);else s=dr(s)?!!s.capture:!!s,n=Qu(n),t&&t[pr]?(t=t.i,e=String(e).toString(),e in t.g&&(i=t.g[e],n=ki(i,n,s,r),-1<n&&(gr(i[n]),Array.prototype.splice.call(i,n,1),i.length==0&&(delete t.g[e],t.h--)))):t&&(t=go(t))&&(e=t.g[e.toString()],t=-1,e&&(t=ki(e,n,s,r)),(n=-1<t?e[t]:null)&&po(n))}function po(t){if(typeof t!="number"&&t&&!t.fa){var e=t.src;if(e&&e[pr])Ci(e.i,t);else{var n=t.type,s=t.proxy;e.removeEventListener?e.removeEventListener(n,s,t.capture):e.detachEvent?e.detachEvent(Wu(n),s):e.addListener&&e.removeListener&&e.removeListener(s),(n=go(e))?(Ci(n,t),n.h==0&&(n.src=null,e[fo]=null)):gr(t)}}}function Wu(t){return t in ii?ii[t]:ii[t]="on"+t}function gm(t,e){if(t.fa)t=!0;else{e=new xn(e,this);var n=t.listener,s=t.la||t.src;t.ia&&po(t),t=n.call(s,e)}return t}function go(t){return t=t[fo],t instanceof mr?t:null}var oi="__closure_events_fn_"+(1e9*Math.random()>>>0);function Qu(t){return typeof t=="function"?t:(t[oi]||(t[oi]=function(e){return t.handleEvent(e)}),t[oi])}function X(){dt.call(this),this.i=new mr(this),this.S=this,this.J=null}Y(X,dt);X.prototype[pr]=!0;X.prototype.removeEventListener=function(t,e,n,s){Gu(this,t,e,n,s)};function te(t,e){var n,s=t.J;if(s)for(n=[];s;s=s.J)n.push(s);if(t=t.S,s=e.type||e,typeof e=="string")e=new ae(e,t);else if(e instanceof ae)e.target=e.target||t;else{var r=e;e=new ae(s,t),Hu(e,r)}if(r=!0,n)for(var i=n.length-1;0<=i;i--){var o=e.g=n[i];r=ws(o,s,!0,e)&&r}if(o=e.g=t,r=ws(o,s,!0,e)&&r,r=ws(o,s,!1,e)&&r,n)for(i=0;i<n.length;i++)o=e.g=n[i],r=ws(o,s,!1,e)&&r}X.prototype.N=function(){if(X.$.N.call(this),this.i){var t=this.i,e;for(e in t.g){for(var n=t.g[e],s=0;s<n.length;s++)gr(n[s]);delete t.g[e],t.h--}}this.J=null};X.prototype.O=function(t,e,n,s){return this.i.add(String(t),e,!1,n,s)};X.prototype.P=function(t,e,n,s){return this.i.add(String(t),e,!0,n,s)};function ws(t,e,n,s){if(e=t.i.g[String(e)],!e)return!0;e=e.concat();for(var r=!0,i=0;i<e.length;++i){var o=e[i];if(o&&!o.fa&&o.capture==n){var a=o.listener,c=o.la||o.src;o.ia&&Ci(t.i,o),r=a.call(c,s)!==!1&&r}}return r&&!s.defaultPrevented}var mo=S.JSON.stringify;class mm{constructor(e,n){this.i=e,this.j=n,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}function ym(){var t=yo;let e=null;return t.g&&(e=t.g,t.g=t.g.next,t.g||(t.h=null),e.next=null),e}class vm{constructor(){this.h=this.g=null}add(e,n){const s=Xu.get();s.set(e,n),this.h?this.h.next=s:this.g=s,this.h=s}}var Xu=new mm(()=>new _m,t=>t.reset());class _m{constructor(){this.next=this.g=this.h=null}set(e,n){this.h=e,this.g=n,this.next=null}reset(){this.next=this.g=this.h=null}}function wm(t){var e=1;t=t.split(":");const n=[];for(;0<e&&t.length;)n.push(t.shift()),e--;return t.length&&n.push(t.join(":")),n}function Em(t){S.setTimeout(()=>{throw t},0)}let Un,Fn=!1,yo=new vm,Yu=()=>{const t=S.Promise.resolve(void 0);Un=()=>{t.then(Tm)}};var Tm=()=>{for(var t;t=ym();){try{t.h.call(t.g)}catch(n){Em(n)}var e=Xu;e.j(t),100>e.h&&(e.h++,t.next=e.g,e.g=t)}Fn=!1};function yr(t,e){X.call(this),this.h=t||1,this.g=e||S,this.j=oe(this.qb,this),this.l=Date.now()}Y(yr,X);m=yr.prototype;m.ga=!1;m.T=null;m.qb=function(){if(this.ga){var t=Date.now()-this.l;0<t&&t<.8*this.h?this.T=this.g.setTimeout(this.j,this.h-t):(this.T&&(this.g.clearTimeout(this.T),this.T=null),te(this,"tick"),this.ga&&(vo(this),this.start()))}};m.start=function(){this.ga=!0,this.T||(this.T=this.g.setTimeout(this.j,this.h),this.l=Date.now())};function vo(t){t.ga=!1,t.T&&(t.g.clearTimeout(t.T),t.T=null)}m.N=function(){yr.$.N.call(this),vo(this),delete this.g};function _o(t,e,n){if(typeof t=="function")n&&(t=oe(t,n));else if(t&&typeof t.handleEvent=="function")t=oe(t.handleEvent,t);else throw Error("Invalid listener argument");return 2147483647<Number(e)?-1:S.setTimeout(t,e||0)}function Ju(t){t.g=_o(()=>{t.g=null,t.i&&(t.i=!1,Ju(t))},t.j);const e=t.h;t.h=null,t.m.apply(null,e)}class Im extends dt{constructor(e,n){super(),this.m=e,this.j=n,this.h=null,this.i=!1,this.g=null}l(e){this.h=arguments,this.g?this.i=!0:Ju(this)}N(){super.N(),this.g&&(S.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Vn(t){dt.call(this),this.h=t,this.g={}}Y(Vn,dt);var Ga=[];function Zu(t,e,n,s){Array.isArray(n)||(n&&(Ga[0]=n.toString()),n=Ga);for(var r=0;r<n.length;r++){var i=Ku(e,n[r],s||t.handleEvent,!1,t.h||t);if(!i)break;t.g[i.key]=i}}function el(t){ho(t.g,function(e,n){this.g.hasOwnProperty(n)&&po(e)},t),t.g={}}Vn.prototype.N=function(){Vn.$.N.call(this),el(this)};Vn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};function vr(){this.g=!0}vr.prototype.Ea=function(){this.g=!1};function Sm(t,e,n,s,r,i){t.info(function(){if(t.g)if(i)for(var o="",a=i.split("&"),c=0;c<a.length;c++){var u=a[c].split("=");if(1<u.length){var l=u[0];u=u[1];var h=l.split("_");o=2<=h.length&&h[1]=="type"?o+(l+"="+u+"&"):o+(l+"=redacted&")}}else o=null;else o=i;return"XMLHTTP REQ ("+s+") [attempt "+r+"]: "+e+`
`+n+`
`+o})}function bm(t,e,n,s,r,i,o){t.info(function(){return"XMLHTTP RESP ("+s+") [ attempt "+r+"]: "+e+`
`+n+`
`+i+" "+o})}function $t(t,e,n,s){t.info(function(){return"XMLHTTP TEXT ("+e+"): "+Cm(t,n)+(s?" "+s:"")})}function Am(t,e){t.info(function(){return"TIMEOUT: "+e})}vr.prototype.info=function(){};function Cm(t,e){if(!t.g)return e;if(!e)return null;try{var n=JSON.parse(e);if(n){for(t=0;t<n.length;t++)if(Array.isArray(n[t])){var s=n[t];if(!(2>s.length)){var r=s[1];if(Array.isArray(r)&&!(1>r.length)){var i=r[0];if(i!="noop"&&i!="stop"&&i!="close")for(var o=1;o<r.length;o++)r[o]=""}}}}return mo(n)}catch{return e}}var Pt={},Wa=null;function _r(){return Wa=Wa||new X}Pt.Ta="serverreachability";function tl(t){ae.call(this,Pt.Ta,t)}Y(tl,ae);function Bn(t){const e=_r();te(e,new tl(e))}Pt.STAT_EVENT="statevent";function nl(t,e){ae.call(this,Pt.STAT_EVENT,t),this.stat=e}Y(nl,ae);function fe(t){const e=_r();te(e,new nl(e,t))}Pt.Ua="timingevent";function sl(t,e){ae.call(this,Pt.Ua,t),this.size=e}Y(sl,ae);function ts(t,e){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return S.setTimeout(function(){t()},e)}var wr={NO_ERROR:0,rb:1,Eb:2,Db:3,yb:4,Cb:5,Fb:6,Qa:7,TIMEOUT:8,Ib:9},rl={wb:"complete",Sb:"success",Ra:"error",Qa:"abort",Kb:"ready",Lb:"readystatechange",TIMEOUT:"timeout",Gb:"incrementaldata",Jb:"progress",zb:"downloadprogress",$b:"uploadprogress"};function wo(){}wo.prototype.h=null;function Qa(t){return t.h||(t.h=t.i())}function il(){}var ns={OPEN:"a",vb:"b",Ra:"c",Hb:"d"};function Eo(){ae.call(this,"d")}Y(Eo,ae);function To(){ae.call(this,"c")}Y(To,ae);var Ri;function Er(){}Y(Er,wo);Er.prototype.g=function(){return new XMLHttpRequest};Er.prototype.i=function(){return{}};Ri=new Er;function ss(t,e,n,s){this.l=t,this.j=e,this.m=n,this.W=s||1,this.U=new Vn(this),this.P=km,t=Si?125:void 0,this.V=new yr(t),this.I=null,this.i=!1,this.s=this.A=this.v=this.L=this.G=this.Y=this.B=null,this.F=[],this.g=null,this.C=0,this.o=this.u=null,this.ca=-1,this.J=!1,this.O=0,this.M=null,this.ba=this.K=this.aa=this.S=!1,this.h=new ol}function ol(){this.i=null,this.g="",this.h=!1}var km=45e3,Ni={},Hs={};m=ss.prototype;m.setTimeout=function(t){this.P=t};function Di(t,e,n){t.L=1,t.v=Ir(We(e)),t.s=n,t.S=!0,al(t,null)}function al(t,e){t.G=Date.now(),rs(t),t.A=We(t.v);var n=t.A,s=t.W;Array.isArray(s)||(s=[String(s)]),gl(n.i,"t",s),t.C=0,n=t.l.J,t.h=new ol,t.g=xl(t.l,n?e:null,!t.s),0<t.O&&(t.M=new Im(oe(t.Pa,t,t.g),t.O)),Zu(t.U,t.g,"readystatechange",t.nb),e=t.I?zu(t.I):{},t.s?(t.u||(t.u="POST"),e["Content-Type"]="application/x-www-form-urlencoded",t.g.ha(t.A,t.u,t.s,e)):(t.u="GET",t.g.ha(t.A,t.u,null,e)),Bn(),Sm(t.j,t.u,t.A,t.m,t.W,t.s)}m.nb=function(t){t=t.target;const e=this.M;e&&ke(t)==3?e.l():this.Pa(t)};m.Pa=function(t){try{if(t==this.g)e:{const l=ke(this.g);var e=this.g.Ia();const h=this.g.da();if(!(3>l)&&(l!=3||Si||this.g&&(this.h.h||this.g.ja()||Za(this.g)))){this.J||l!=4||e==7||(e==8||0>=h?Bn(3):Bn(2)),Tr(this);var n=this.g.da();this.ca=n;t:if(cl(this)){var s=Za(this.g);t="";var r=s.length,i=ke(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){yt(this),An(this);var o="";break t}this.h.i=new S.TextDecoder}for(e=0;e<r;e++)this.h.h=!0,t+=this.h.i.decode(s[e],{stream:i&&e==r-1});s.splice(0,r),this.h.g+=t,this.C=0,o=this.h.g}else o=this.g.ja();if(this.i=n==200,bm(this.j,this.u,this.A,this.m,this.W,l,n),this.i){if(this.aa&&!this.K){t:{if(this.g){var a,c=this.g;if((a=c.g?c.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!Ln(a)){var u=a;break t}}u=null}if(n=u)$t(this.j,this.m,n,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Oi(this,n);else{this.i=!1,this.o=3,fe(12),yt(this),An(this);break e}}this.S?(ul(this,l,o),Si&&this.i&&l==3&&(Zu(this.U,this.V,"tick",this.mb),this.V.start())):($t(this.j,this.m,o,null),Oi(this,o)),l==4&&yt(this),this.i&&!this.J&&(l==4?Ol(this.l,this):(this.i=!1,rs(this)))}else Qm(this.g),n==400&&0<o.indexOf("Unknown SID")?(this.o=3,fe(12)):(this.o=0,fe(13)),yt(this),An(this)}}}catch{}finally{}};function cl(t){return t.g?t.u=="GET"&&t.L!=2&&t.l.Ha:!1}function ul(t,e,n){let s=!0,r;for(;!t.J&&t.C<n.length;)if(r=Rm(t,n),r==Hs){e==4&&(t.o=4,fe(14),s=!1),$t(t.j,t.m,null,"[Incomplete Response]");break}else if(r==Ni){t.o=4,fe(15),$t(t.j,t.m,n,"[Invalid Chunk]"),s=!1;break}else $t(t.j,t.m,r,null),Oi(t,r);cl(t)&&r!=Hs&&r!=Ni&&(t.h.g="",t.C=0),e!=4||n.length!=0||t.h.h||(t.o=1,fe(16),s=!1),t.i=t.i&&s,s?0<n.length&&!t.ba&&(t.ba=!0,e=t.l,e.g==t&&e.ca&&!e.M&&(e.l.info("Great, no buffering proxy detected. Bytes received: "+n.length),ko(e),e.M=!0,fe(11))):($t(t.j,t.m,n,"[Invalid Chunked Response]"),yt(t),An(t))}m.mb=function(){if(this.g){var t=ke(this.g),e=this.g.ja();this.C<e.length&&(Tr(this),ul(this,t,e),this.i&&t!=4&&rs(this))}};function Rm(t,e){var n=t.C,s=e.indexOf(`
`,n);return s==-1?Hs:(n=Number(e.substring(n,s)),isNaN(n)?Ni:(s+=1,s+n>e.length?Hs:(e=e.slice(s,s+n),t.C=s+n,e)))}m.cancel=function(){this.J=!0,yt(this)};function rs(t){t.Y=Date.now()+t.P,ll(t,t.P)}function ll(t,e){if(t.B!=null)throw Error("WatchDog timer not null");t.B=ts(oe(t.lb,t),e)}function Tr(t){t.B&&(S.clearTimeout(t.B),t.B=null)}m.lb=function(){this.B=null;const t=Date.now();0<=t-this.Y?(Am(this.j,this.A),this.L!=2&&(Bn(),fe(17)),yt(this),this.o=2,An(this)):ll(this,this.Y-t)};function An(t){t.l.H==0||t.J||Ol(t.l,t)}function yt(t){Tr(t);var e=t.M;e&&typeof e.sa=="function"&&e.sa(),t.M=null,vo(t.V),el(t.U),t.g&&(e=t.g,t.g=null,e.abort(),e.sa())}function Oi(t,e){try{var n=t.l;if(n.H!=0&&(n.g==t||Pi(n.i,t))){if(!t.K&&Pi(n.i,t)&&n.H==3){try{var s=n.Ja.g.parse(e)}catch{s=null}if(Array.isArray(s)&&s.length==3){var r=s;if(r[0]==0){e:if(!n.u){if(n.g)if(n.g.G+3e3<t.G)Ws(n),Ar(n);else break e;Co(n),fe(18)}}else n.Fa=r[1],0<n.Fa-n.V&&37500>r[2]&&n.G&&n.A==0&&!n.v&&(n.v=ts(oe(n.ib,n),6e3));if(1>=vl(n.i)&&n.oa){try{n.oa()}catch{}n.oa=void 0}}else vt(n,11)}else if((t.K||n.g==t)&&Ws(n),!Ln(e))for(r=n.Ja.g.parse(e),e=0;e<r.length;e++){let u=r[e];if(n.V=u[0],u=u[1],n.H==2)if(u[0]=="c"){n.K=u[1],n.pa=u[2];const l=u[3];l!=null&&(n.ra=l,n.l.info("VER="+n.ra));const h=u[4];h!=null&&(n.Ga=h,n.l.info("SVER="+n.Ga));const d=u[5];d!=null&&typeof d=="number"&&0<d&&(s=1.5*d,n.L=s,n.l.info("backChannelRequestTimeoutMs_="+s)),s=n;const p=t.g;if(p){const y=p.g?p.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(y){var i=s.i;i.g||y.indexOf("spdy")==-1&&y.indexOf("quic")==-1&&y.indexOf("h2")==-1||(i.j=i.l,i.g=new Set,i.h&&(Io(i,i.h),i.h=null))}if(s.F){const w=p.g?p.g.getResponseHeader("X-HTTP-Session-Id"):null;w&&(s.Da=w,F(s.I,s.F,w))}}n.H=3,n.h&&n.h.Ba(),n.ca&&(n.S=Date.now()-t.G,n.l.info("Handshake RTT: "+n.S+"ms")),s=n;var o=t;if(s.wa=Ll(s,s.J?s.pa:null,s.Y),o.K){_l(s.i,o);var a=o,c=s.L;c&&a.setTimeout(c),a.B&&(Tr(a),rs(a)),s.g=o}else Nl(s);0<n.j.length&&Cr(n)}else u[0]!="stop"&&u[0]!="close"||vt(n,7);else n.H==3&&(u[0]=="stop"||u[0]=="close"?u[0]=="stop"?vt(n,7):Ao(n):u[0]!="noop"&&n.h&&n.h.Aa(u),n.A=0)}}Bn(4)}catch{}}function Nm(t){if(t.Z&&typeof t.Z=="function")return t.Z();if(typeof Map<"u"&&t instanceof Map||typeof Set<"u"&&t instanceof Set)return Array.from(t.values());if(typeof t=="string")return t.split("");if(hr(t)){for(var e=[],n=t.length,s=0;s<n;s++)e.push(t[s]);return e}e=[],n=0;for(s in t)e[n++]=t[s];return e}function Dm(t){if(t.ta&&typeof t.ta=="function")return t.ta();if(!t.Z||typeof t.Z!="function"){if(typeof Map<"u"&&t instanceof Map)return Array.from(t.keys());if(!(typeof Set<"u"&&t instanceof Set)){if(hr(t)||typeof t=="string"){var e=[];t=t.length;for(var n=0;n<t;n++)e.push(n);return e}e=[],n=0;for(const s in t)e[n++]=s;return e}}}function hl(t,e){if(t.forEach&&typeof t.forEach=="function")t.forEach(e,void 0);else if(hr(t)||typeof t=="string")Array.prototype.forEach.call(t,e,void 0);else for(var n=Dm(t),s=Nm(t),r=s.length,i=0;i<r;i++)e.call(void 0,s[i],n&&n[i],t)}var dl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Om(t,e){if(t){t=t.split("&");for(var n=0;n<t.length;n++){var s=t[n].indexOf("="),r=null;if(0<=s){var i=t[n].substring(0,s);r=t[n].substring(s+1)}else i=t[n];e(i,r?decodeURIComponent(r.replace(/\+/g," ")):"")}}}function Et(t){if(this.g=this.s=this.j="",this.m=null,this.o=this.l="",this.h=!1,t instanceof Et){this.h=t.h,Ks(this,t.j),this.s=t.s,this.g=t.g,Gs(this,t.m),this.l=t.l;var e=t.i,n=new $n;n.i=e.i,e.g&&(n.g=new Map(e.g),n.h=e.h),Xa(this,n),this.o=t.o}else t&&(e=String(t).match(dl))?(this.h=!1,Ks(this,e[1]||"",!0),this.s=En(e[2]||""),this.g=En(e[3]||"",!0),Gs(this,e[4]),this.l=En(e[5]||"",!0),Xa(this,e[6]||"",!0),this.o=En(e[7]||"")):(this.h=!1,this.i=new $n(null,this.h))}Et.prototype.toString=function(){var t=[],e=this.j;e&&t.push(Tn(e,Ya,!0),":");var n=this.g;return(n||e=="file")&&(t.push("//"),(e=this.s)&&t.push(Tn(e,Ya,!0),"@"),t.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),n=this.m,n!=null&&t.push(":",String(n))),(n=this.l)&&(this.g&&n.charAt(0)!="/"&&t.push("/"),t.push(Tn(n,n.charAt(0)=="/"?Lm:Mm,!0))),(n=this.i.toString())&&t.push("?",n),(n=this.o)&&t.push("#",Tn(n,Um)),t.join("")};function We(t){return new Et(t)}function Ks(t,e,n){t.j=n?En(e,!0):e,t.j&&(t.j=t.j.replace(/:$/,""))}function Gs(t,e){if(e){if(e=Number(e),isNaN(e)||0>e)throw Error("Bad port number "+e);t.m=e}else t.m=null}function Xa(t,e,n){e instanceof $n?(t.i=e,Fm(t.i,t.h)):(n||(e=Tn(e,xm)),t.i=new $n(e,t.h))}function F(t,e,n){t.i.set(e,n)}function Ir(t){return F(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function En(t,e){return t?e?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Tn(t,e,n){return typeof t=="string"?(t=encodeURI(t).replace(e,Pm),n&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function Pm(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var Ya=/[#\/\?@]/g,Mm=/[#\?:]/g,Lm=/[#\?]/g,xm=/[#\?@]/g,Um=/#/g;function $n(t,e){this.h=this.g=null,this.i=t||null,this.j=!!e}function ft(t){t.g||(t.g=new Map,t.h=0,t.i&&Om(t.i,function(e,n){t.add(decodeURIComponent(e.replace(/\+/g," ")),n)}))}m=$n.prototype;m.add=function(t,e){ft(this),this.i=null,t=on(this,t);var n=this.g.get(t);return n||this.g.set(t,n=[]),n.push(e),this.h+=1,this};function fl(t,e){ft(t),e=on(t,e),t.g.has(e)&&(t.i=null,t.h-=t.g.get(e).length,t.g.delete(e))}function pl(t,e){return ft(t),e=on(t,e),t.g.has(e)}m.forEach=function(t,e){ft(this),this.g.forEach(function(n,s){n.forEach(function(r){t.call(e,r,s,this)},this)},this)};m.ta=function(){ft(this);const t=Array.from(this.g.values()),e=Array.from(this.g.keys()),n=[];for(let s=0;s<e.length;s++){const r=t[s];for(let i=0;i<r.length;i++)n.push(e[s])}return n};m.Z=function(t){ft(this);let e=[];if(typeof t=="string")pl(this,t)&&(e=e.concat(this.g.get(on(this,t))));else{t=Array.from(this.g.values());for(let n=0;n<t.length;n++)e=e.concat(t[n])}return e};m.set=function(t,e){return ft(this),this.i=null,t=on(this,t),pl(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[e]),this.h+=1,this};m.get=function(t,e){return t?(t=this.Z(t),0<t.length?String(t[0]):e):e};function gl(t,e,n){fl(t,e),0<n.length&&(t.i=null,t.g.set(on(t,e),uo(n)),t.h+=n.length)}m.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],e=Array.from(this.g.keys());for(var n=0;n<e.length;n++){var s=e[n];const i=encodeURIComponent(String(s)),o=this.Z(s);for(s=0;s<o.length;s++){var r=i;o[s]!==""&&(r+="="+encodeURIComponent(String(o[s]))),t.push(r)}}return this.i=t.join("&")};function on(t,e){return e=String(e),t.j&&(e=e.toLowerCase()),e}function Fm(t,e){e&&!t.j&&(ft(t),t.i=null,t.g.forEach(function(n,s){var r=s.toLowerCase();s!=r&&(fl(this,s),gl(this,r,n))},t)),t.j=e}var Vm=class{constructor(t,e){this.g=t,this.map=e}};function ml(t){this.l=t||Bm,S.PerformanceNavigationTiming?(t=S.performance.getEntriesByType("navigation"),t=0<t.length&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(S.g&&S.g.Ka&&S.g.Ka()&&S.g.Ka().ec),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}var Bm=10;function yl(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function vl(t){return t.h?1:t.g?t.g.size:0}function Pi(t,e){return t.h?t.h==e:t.g?t.g.has(e):!1}function Io(t,e){t.g?t.g.add(e):t.h=e}function _l(t,e){t.h&&t.h==e?t.h=null:t.g&&t.g.has(e)&&t.g.delete(e)}ml.prototype.cancel=function(){if(this.i=wl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function wl(t){if(t.h!=null)return t.i.concat(t.h.F);if(t.g!=null&&t.g.size!==0){let e=t.i;for(const n of t.g.values())e=e.concat(n.F);return e}return uo(t.i)}var $m=class{stringify(t){return S.JSON.stringify(t,void 0)}parse(t){return S.JSON.parse(t,void 0)}};function qm(){this.g=new $m}function jm(t,e,n){const s=n||"";try{hl(t,function(r,i){let o=r;dr(r)&&(o=mo(r)),e.push(s+i+"="+encodeURIComponent(o))})}catch(r){throw e.push(s+"type="+encodeURIComponent("_badmap")),r}}function zm(t,e){const n=new vr;if(S.Image){const s=new Image;s.onload=_s(Es,n,s,"TestLoadImage: loaded",!0,e),s.onerror=_s(Es,n,s,"TestLoadImage: error",!1,e),s.onabort=_s(Es,n,s,"TestLoadImage: abort",!1,e),s.ontimeout=_s(Es,n,s,"TestLoadImage: timeout",!1,e),S.setTimeout(function(){s.ontimeout&&s.ontimeout()},1e4),s.src=t}else e(!1)}function Es(t,e,n,s,r){try{e.onload=null,e.onerror=null,e.onabort=null,e.ontimeout=null,r(s)}catch{}}function is(t){this.l=t.fc||null,this.j=t.ob||!1}Y(is,wo);is.prototype.g=function(){return new Sr(this.l,this.j)};is.prototype.i=function(t){return function(){return t}}({});function Sr(t,e){X.call(this),this.F=t,this.u=e,this.m=void 0,this.readyState=So,this.status=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.v=new Headers,this.h=null,this.C="GET",this.B="",this.g=!1,this.A=this.j=this.l=null}Y(Sr,X);var So=0;m=Sr.prototype;m.open=function(t,e){if(this.readyState!=So)throw this.abort(),Error("Error reopening a connection");this.C=t,this.B=e,this.readyState=1,qn(this)};m.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const e={headers:this.v,method:this.C,credentials:this.m,cache:void 0};t&&(e.body=t),(this.F||S).fetch(new Request(this.B,e)).then(this.$a.bind(this),this.ka.bind(this))};m.abort=function(){this.response=this.responseText="",this.v=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,os(this)),this.readyState=So};m.$a=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,qn(this)),this.g&&(this.readyState=3,qn(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Ya.bind(this),this.ka.bind(this));else if(typeof S.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.u){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.A=new TextDecoder;El(this)}else t.text().then(this.Za.bind(this),this.ka.bind(this))};function El(t){t.j.read().then(t.Xa.bind(t)).catch(t.ka.bind(t))}m.Xa=function(t){if(this.g){if(this.u&&t.value)this.response.push(t.value);else if(!this.u){var e=t.value?t.value:new Uint8Array(0);(e=this.A.decode(e,{stream:!t.done}))&&(this.response=this.responseText+=e)}t.done?os(this):qn(this),this.readyState==3&&El(this)}};m.Za=function(t){this.g&&(this.response=this.responseText=t,os(this))};m.Ya=function(t){this.g&&(this.response=t,os(this))};m.ka=function(){this.g&&os(this)};function os(t){t.readyState=4,t.l=null,t.j=null,t.A=null,qn(t)}m.setRequestHeader=function(t,e){this.v.append(t,e)};m.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""};m.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],e=this.h.entries();for(var n=e.next();!n.done;)n=n.value,t.push(n[0]+": "+n[1]),n=e.next();return t.join(`\r
`)};function qn(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(Sr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});var Hm=S.JSON.parse;function z(t){X.call(this),this.headers=new Map,this.u=t||null,this.h=!1,this.C=this.g=null,this.I="",this.m=0,this.j="",this.l=this.G=this.v=this.F=!1,this.B=0,this.A=null,this.K=Tl,this.L=this.M=!1}Y(z,X);var Tl="",Km=/^https?$/i,Gm=["POST","PUT"];m=z.prototype;m.Oa=function(t){this.M=t};m.ha=function(t,e,n,s){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.I+"; newUri="+t);e=e?e.toUpperCase():"GET",this.I=t,this.j="",this.m=0,this.F=!1,this.h=!0,this.g=this.u?this.u.g():Ri.g(),this.C=this.u?Qa(this.u):Qa(Ri),this.g.onreadystatechange=oe(this.La,this);try{this.G=!0,this.g.open(e,String(t),!0),this.G=!1}catch(i){Ja(this,i);return}if(t=n||"",n=new Map(this.headers),s)if(Object.getPrototypeOf(s)===Object.prototype)for(var r in s)n.set(r,s[r]);else if(typeof s.keys=="function"&&typeof s.get=="function")for(const i of s.keys())n.set(i,s.get(i));else throw Error("Unknown input type for opt_headers: "+String(s));s=Array.from(n.keys()).find(i=>i.toLowerCase()=="content-type"),r=S.FormData&&t instanceof S.FormData,!(0<=Bu(Gm,e))||s||r||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[i,o]of n)this.g.setRequestHeader(i,o);this.K&&(this.g.responseType=this.K),"withCredentials"in this.g&&this.g.withCredentials!==this.M&&(this.g.withCredentials=this.M);try{bl(this),0<this.B&&((this.L=Wm(this.g))?(this.g.timeout=this.B,this.g.ontimeout=oe(this.ua,this)):this.A=_o(this.ua,this.B,this)),this.v=!0,this.g.send(t),this.v=!1}catch(i){Ja(this,i)}};function Wm(t){return Yt&&typeof t.timeout=="number"&&t.ontimeout!==void 0}m.ua=function(){typeof co<"u"&&this.g&&(this.j="Timed out after "+this.B+"ms, aborting",this.m=8,te(this,"timeout"),this.abort(8))};function Ja(t,e){t.h=!1,t.g&&(t.l=!0,t.g.abort(),t.l=!1),t.j=e,t.m=5,Il(t),br(t)}function Il(t){t.F||(t.F=!0,te(t,"complete"),te(t,"error"))}m.abort=function(t){this.g&&this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1,this.m=t||7,te(this,"complete"),te(this,"abort"),br(this))};m.N=function(){this.g&&(this.h&&(this.h=!1,this.l=!0,this.g.abort(),this.l=!1),br(this,!0)),z.$.N.call(this)};m.La=function(){this.s||(this.G||this.v||this.l?Sl(this):this.kb())};m.kb=function(){Sl(this)};function Sl(t){if(t.h&&typeof co<"u"&&(!t.C[1]||ke(t)!=4||t.da()!=2)){if(t.v&&ke(t)==4)_o(t.La,0,t);else if(te(t,"readystatechange"),ke(t)==4){t.h=!1;try{const o=t.da();e:switch(o){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break e;default:e=!1}var n;if(!(n=e)){var s;if(s=o===0){var r=String(t.I).match(dl)[1]||null;!r&&S.self&&S.self.location&&(r=S.self.location.protocol.slice(0,-1)),s=!Km.test(r?r.toLowerCase():"")}n=s}if(n)te(t,"complete"),te(t,"success");else{t.m=6;try{var i=2<ke(t)?t.g.statusText:""}catch{i=""}t.j=i+" ["+t.da()+"]",Il(t)}}finally{br(t)}}}}function br(t,e){if(t.g){bl(t);const n=t.g,s=t.C[0]?()=>{}:null;t.g=null,t.C=null,e||te(t,"ready");try{n.onreadystatechange=s}catch{}}}function bl(t){t.g&&t.L&&(t.g.ontimeout=null),t.A&&(S.clearTimeout(t.A),t.A=null)}m.isActive=function(){return!!this.g};function ke(t){return t.g?t.g.readyState:0}m.da=function(){try{return 2<ke(this)?this.g.status:-1}catch{return-1}};m.ja=function(){try{return this.g?this.g.responseText:""}catch{return""}};m.Wa=function(t){if(this.g){var e=this.g.responseText;return t&&e.indexOf(t)==0&&(e=e.substring(t.length)),Hm(e)}};function Za(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.K){case Tl:case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function Qm(t){const e={};t=(t.g&&2<=ke(t)&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let s=0;s<t.length;s++){if(Ln(t[s]))continue;var n=wm(t[s]);const r=n[0];if(n=n[1],typeof n!="string")continue;n=n.trim();const i=e[r]||[];e[r]=i,i.push(n)}dm(e,function(s){return s.join(", ")})}m.Ia=function(){return this.m};m.Sa=function(){return typeof this.j=="string"?this.j:String(this.j)};function Al(t){let e="";return ho(t,function(n,s){e+=s,e+=":",e+=n,e+=`\r
`}),e}function bo(t,e,n){e:{for(s in n){var s=!1;break e}s=!0}s||(n=Al(n),typeof t=="string"?n!=null&&encodeURIComponent(String(n)):F(t,e,n))}function vn(t,e,n){return n&&n.internalChannelParams&&n.internalChannelParams[t]||e}function Cl(t){this.Ga=0,this.j=[],this.l=new vr,this.pa=this.wa=this.I=this.Y=this.g=this.Da=this.F=this.na=this.o=this.U=this.s=null,this.fb=this.W=0,this.cb=vn("failFast",!1,t),this.G=this.v=this.u=this.m=this.h=null,this.aa=!0,this.Fa=this.V=-1,this.ba=this.A=this.C=0,this.ab=vn("baseRetryDelayMs",5e3,t),this.hb=vn("retryDelaySeedMs",1e4,t),this.eb=vn("forwardChannelMaxRetries",2,t),this.xa=vn("forwardChannelRequestTimeoutMs",2e4,t),this.va=t&&t.xmlHttpFactory||void 0,this.Ha=t&&t.dc||!1,this.L=void 0,this.J=t&&t.supportsCrossDomainXhr||!1,this.K="",this.i=new ml(t&&t.concurrentRequestLimit),this.Ja=new qm,this.P=t&&t.fastHandshake||!1,this.O=t&&t.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.bb=t&&t.bc||!1,t&&t.Ea&&this.l.Ea(),t&&t.forceLongPolling&&(this.aa=!1),this.ca=!this.P&&this.aa&&t&&t.detectBufferingProxy||!1,this.qa=void 0,t&&t.longPollingTimeout&&0<t.longPollingTimeout&&(this.qa=t.longPollingTimeout),this.oa=void 0,this.S=0,this.M=!1,this.ma=this.B=null}m=Cl.prototype;m.ra=8;m.H=1;function Ao(t){if(kl(t),t.H==3){var e=t.W++,n=We(t.I);if(F(n,"SID",t.K),F(n,"RID",e),F(n,"TYPE","terminate"),as(t,n),e=new ss(t,t.l,e),e.L=2,e.v=Ir(We(n)),n=!1,S.navigator&&S.navigator.sendBeacon)try{n=S.navigator.sendBeacon(e.v.toString(),"")}catch{}!n&&S.Image&&(new Image().src=e.v,n=!0),n||(e.g=xl(e.l,null),e.g.ha(e.v)),e.G=Date.now(),rs(e)}Ml(t)}function Ar(t){t.g&&(ko(t),t.g.cancel(),t.g=null)}function kl(t){Ar(t),t.u&&(S.clearTimeout(t.u),t.u=null),Ws(t),t.i.cancel(),t.m&&(typeof t.m=="number"&&S.clearTimeout(t.m),t.m=null)}function Cr(t){if(!yl(t.i)&&!t.m){t.m=!0;var e=t.Na;Un||Yu(),Fn||(Un(),Fn=!0),yo.add(e,t),t.C=0}}function Xm(t,e){return vl(t.i)>=t.i.j-(t.m?1:0)?!1:t.m?(t.j=e.F.concat(t.j),!0):t.H==1||t.H==2||t.C>=(t.cb?0:t.eb)?!1:(t.m=ts(oe(t.Na,t,e),Pl(t,t.C)),t.C++,!0)}m.Na=function(t){if(this.m)if(this.m=null,this.H==1){if(!t){this.W=Math.floor(1e5*Math.random()),t=this.W++;const r=new ss(this,this.l,t);let i=this.s;if(this.U&&(i?(i=zu(i),Hu(i,this.U)):i=this.U),this.o!==null||this.O||(r.I=i,i=null),this.P)e:{for(var e=0,n=0;n<this.j.length;n++){t:{var s=this.j[n];if("__data__"in s.map&&(s=s.map.__data__,typeof s=="string")){s=s.length;break t}s=void 0}if(s===void 0)break;if(e+=s,4096<e){e=n;break e}if(e===4096||n===this.j.length-1){e=n+1;break e}}e=1e3}else e=1e3;e=Rl(this,r,e),n=We(this.I),F(n,"RID",t),F(n,"CVER",22),this.F&&F(n,"X-HTTP-Session-Id",this.F),as(this,n),i&&(this.O?e="headers="+encodeURIComponent(String(Al(i)))+"&"+e:this.o&&bo(n,this.o,i)),Io(this.i,r),this.bb&&F(n,"TYPE","init"),this.P?(F(n,"$req",e),F(n,"SID","null"),r.aa=!0,Di(r,n,null)):Di(r,n,e),this.H=2}}else this.H==3&&(t?ec(this,t):this.j.length==0||yl(this.i)||ec(this))};function ec(t,e){var n;e?n=e.m:n=t.W++;const s=We(t.I);F(s,"SID",t.K),F(s,"RID",n),F(s,"AID",t.V),as(t,s),t.o&&t.s&&bo(s,t.o,t.s),n=new ss(t,t.l,n,t.C+1),t.o===null&&(n.I=t.s),e&&(t.j=e.F.concat(t.j)),e=Rl(t,n,1e3),n.setTimeout(Math.round(.5*t.xa)+Math.round(.5*t.xa*Math.random())),Io(t.i,n),Di(n,s,e)}function as(t,e){t.na&&ho(t.na,function(n,s){F(e,s,n)}),t.h&&hl({},function(n,s){F(e,s,n)})}function Rl(t,e,n){n=Math.min(t.j.length,n);var s=t.h?oe(t.h.Va,t.h,t):null;e:{var r=t.j;let i=-1;for(;;){const o=["count="+n];i==-1?0<n?(i=r[0].g,o.push("ofs="+i)):i=0:o.push("ofs="+i);let a=!0;for(let c=0;c<n;c++){let u=r[c].g;const l=r[c].map;if(u-=i,0>u)i=Math.max(0,r[c].g-100),a=!1;else try{jm(l,o,"req"+u+"_")}catch{s&&s(l)}}if(a){s=o.join("&");break e}}}return t=t.j.splice(0,n),e.F=t,s}function Nl(t){if(!t.g&&!t.u){t.ba=1;var e=t.Ma;Un||Yu(),Fn||(Un(),Fn=!0),yo.add(e,t),t.A=0}}function Co(t){return t.g||t.u||3<=t.A?!1:(t.ba++,t.u=ts(oe(t.Ma,t),Pl(t,t.A)),t.A++,!0)}m.Ma=function(){if(this.u=null,Dl(this),this.ca&&!(this.M||this.g==null||0>=this.S)){var t=2*this.S;this.l.info("BP detection timer enabled: "+t),this.B=ts(oe(this.jb,this),t)}};m.jb=function(){this.B&&(this.B=null,this.l.info("BP detection timeout reached."),this.l.info("Buffering proxy detected and switch to long-polling!"),this.G=!1,this.M=!0,fe(10),Ar(this),Dl(this))};function ko(t){t.B!=null&&(S.clearTimeout(t.B),t.B=null)}function Dl(t){t.g=new ss(t,t.l,"rpc",t.ba),t.o===null&&(t.g.I=t.s),t.g.O=0;var e=We(t.wa);F(e,"RID","rpc"),F(e,"SID",t.K),F(e,"AID",t.V),F(e,"CI",t.G?"0":"1"),!t.G&&t.qa&&F(e,"TO",t.qa),F(e,"TYPE","xmlhttp"),as(t,e),t.o&&t.s&&bo(e,t.o,t.s),t.L&&t.g.setTimeout(t.L);var n=t.g;t=t.pa,n.L=1,n.v=Ir(We(e)),n.s=null,n.S=!0,al(n,t)}m.ib=function(){this.v!=null&&(this.v=null,Ar(this),Co(this),fe(19))};function Ws(t){t.v!=null&&(S.clearTimeout(t.v),t.v=null)}function Ol(t,e){var n=null;if(t.g==e){Ws(t),ko(t),t.g=null;var s=2}else if(Pi(t.i,e))n=e.F,_l(t.i,e),s=1;else return;if(t.H!=0){if(e.i)if(s==1){n=e.s?e.s.length:0,e=Date.now()-e.G;var r=t.C;s=_r(),te(s,new sl(s,n)),Cr(t)}else Nl(t);else if(r=e.o,r==3||r==0&&0<e.ca||!(s==1&&Xm(t,e)||s==2&&Co(t)))switch(n&&0<n.length&&(e=t.i,e.i=e.i.concat(n)),r){case 1:vt(t,5);break;case 4:vt(t,10);break;case 3:vt(t,6);break;default:vt(t,2)}}}function Pl(t,e){let n=t.ab+Math.floor(Math.random()*t.hb);return t.isActive()||(n*=2),n*e}function vt(t,e){if(t.l.info("Error code "+e),e==2){var n=null;t.h&&(n=null);var s=oe(t.pb,t);n||(n=new Et("//www.google.com/images/cleardot.gif"),S.location&&S.location.protocol=="http"||Ks(n,"https"),Ir(n)),zm(n.toString(),s)}else fe(2);t.H=0,t.h&&t.h.za(e),Ml(t),kl(t)}m.pb=function(t){t?(this.l.info("Successfully pinged google.com"),fe(2)):(this.l.info("Failed to ping google.com"),fe(1))};function Ml(t){if(t.H=0,t.ma=[],t.h){const e=wl(t.i);(e.length!=0||t.j.length!=0)&&(za(t.ma,e),za(t.ma,t.j),t.i.i.length=0,uo(t.j),t.j.length=0),t.h.ya()}}function Ll(t,e,n){var s=n instanceof Et?We(n):new Et(n);if(s.g!="")e&&(s.g=e+"."+s.g),Gs(s,s.m);else{var r=S.location;s=r.protocol,e=e?e+"."+r.hostname:r.hostname,r=+r.port;var i=new Et(null);s&&Ks(i,s),e&&(i.g=e),r&&Gs(i,r),n&&(i.l=n),s=i}return n=t.F,e=t.Da,n&&e&&F(s,n,e),F(s,"VER",t.ra),as(t,s),s}function xl(t,e,n){if(e&&!t.J)throw Error("Can't create secondary domain capable XhrIo object.");return e=n&&t.Ha&&!t.va?new z(new is({ob:!0})):new z(t.va),e.Oa(t.J),e}m.isActive=function(){return!!this.h&&this.h.isActive(this)};function Ul(){}m=Ul.prototype;m.Ba=function(){};m.Aa=function(){};m.za=function(){};m.ya=function(){};m.isActive=function(){return!0};m.Va=function(){};function Qs(){if(Yt&&!(10<=Number(cm)))throw Error("Environmental error: no available transport.")}Qs.prototype.g=function(t,e){return new Ee(t,e)};function Ee(t,e){X.call(this),this.g=new Cl(e),this.l=t,this.h=e&&e.messageUrlParams||null,t=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.s=t,t=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(t?t["X-WebChannel-Content-Type"]=e.messageContentType:t={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.Ca&&(t?t["X-WebChannel-Client-Profile"]=e.Ca:t={"X-WebChannel-Client-Profile":e.Ca}),this.g.U=t,(t=e&&e.cc)&&!Ln(t)&&(this.g.o=t),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!Ln(e)&&(this.g.F=e,t=this.h,t!==null&&e in t&&(t=this.h,e in t&&delete t[e])),this.j=new an(this)}Y(Ee,X);Ee.prototype.m=function(){this.g.h=this.j,this.A&&(this.g.J=!0);var t=this.g,e=this.l,n=this.h||void 0;fe(0),t.Y=e,t.na=n||{},t.G=t.aa,t.I=Ll(t,null,t.Y),Cr(t)};Ee.prototype.close=function(){Ao(this.g)};Ee.prototype.u=function(t){var e=this.g;if(typeof t=="string"){var n={};n.__data__=t,t=n}else this.v&&(n={},n.__data__=mo(t),t=n);e.j.push(new Vm(e.fb++,t)),e.H==3&&Cr(e)};Ee.prototype.N=function(){this.g.h=null,delete this.j,Ao(this.g),delete this.g,Ee.$.N.call(this)};function Fl(t){Eo.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var e=t.__sm__;if(e){e:{for(const n in e){t=n;break e}t=void 0}(this.i=t)&&(t=this.i,e=e!==null&&t in e?e[t]:void 0),this.data=e}else this.data=t}Y(Fl,Eo);function Vl(){To.call(this),this.status=1}Y(Vl,To);function an(t){this.g=t}Y(an,Ul);an.prototype.Ba=function(){te(this.g,"a")};an.prototype.Aa=function(t){te(this.g,new Fl(t))};an.prototype.za=function(t){te(this.g,new Vl)};an.prototype.ya=function(){te(this.g,"b")};function Ym(){this.blockSize=-1}function Ie(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.m=Array(this.blockSize),this.i=this.h=0,this.reset()}Y(Ie,Ym);Ie.prototype.reset=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.i=this.h=0};function ai(t,e,n){n||(n=0);var s=Array(16);if(typeof e=="string")for(var r=0;16>r;++r)s[r]=e.charCodeAt(n++)|e.charCodeAt(n++)<<8|e.charCodeAt(n++)<<16|e.charCodeAt(n++)<<24;else for(r=0;16>r;++r)s[r]=e[n++]|e[n++]<<8|e[n++]<<16|e[n++]<<24;e=t.g[0],n=t.g[1],r=t.g[2];var i=t.g[3],o=e+(i^n&(r^i))+s[0]+3614090360&4294967295;e=n+(o<<7&4294967295|o>>>25),o=i+(r^e&(n^r))+s[1]+3905402710&4294967295,i=e+(o<<12&4294967295|o>>>20),o=r+(n^i&(e^n))+s[2]+606105819&4294967295,r=i+(o<<17&4294967295|o>>>15),o=n+(e^r&(i^e))+s[3]+3250441966&4294967295,n=r+(o<<22&4294967295|o>>>10),o=e+(i^n&(r^i))+s[4]+4118548399&4294967295,e=n+(o<<7&4294967295|o>>>25),o=i+(r^e&(n^r))+s[5]+1200080426&4294967295,i=e+(o<<12&4294967295|o>>>20),o=r+(n^i&(e^n))+s[6]+2821735955&4294967295,r=i+(o<<17&4294967295|o>>>15),o=n+(e^r&(i^e))+s[7]+4249261313&4294967295,n=r+(o<<22&4294967295|o>>>10),o=e+(i^n&(r^i))+s[8]+1770035416&4294967295,e=n+(o<<7&4294967295|o>>>25),o=i+(r^e&(n^r))+s[9]+2336552879&4294967295,i=e+(o<<12&4294967295|o>>>20),o=r+(n^i&(e^n))+s[10]+4294925233&4294967295,r=i+(o<<17&4294967295|o>>>15),o=n+(e^r&(i^e))+s[11]+2304563134&4294967295,n=r+(o<<22&4294967295|o>>>10),o=e+(i^n&(r^i))+s[12]+1804603682&4294967295,e=n+(o<<7&4294967295|o>>>25),o=i+(r^e&(n^r))+s[13]+4254626195&4294967295,i=e+(o<<12&4294967295|o>>>20),o=r+(n^i&(e^n))+s[14]+2792965006&4294967295,r=i+(o<<17&4294967295|o>>>15),o=n+(e^r&(i^e))+s[15]+1236535329&4294967295,n=r+(o<<22&4294967295|o>>>10),o=e+(r^i&(n^r))+s[1]+4129170786&4294967295,e=n+(o<<5&4294967295|o>>>27),o=i+(n^r&(e^n))+s[6]+3225465664&4294967295,i=e+(o<<9&4294967295|o>>>23),o=r+(e^n&(i^e))+s[11]+643717713&4294967295,r=i+(o<<14&4294967295|o>>>18),o=n+(i^e&(r^i))+s[0]+3921069994&4294967295,n=r+(o<<20&4294967295|o>>>12),o=e+(r^i&(n^r))+s[5]+3593408605&4294967295,e=n+(o<<5&4294967295|o>>>27),o=i+(n^r&(e^n))+s[10]+38016083&4294967295,i=e+(o<<9&4294967295|o>>>23),o=r+(e^n&(i^e))+s[15]+3634488961&4294967295,r=i+(o<<14&4294967295|o>>>18),o=n+(i^e&(r^i))+s[4]+3889429448&4294967295,n=r+(o<<20&4294967295|o>>>12),o=e+(r^i&(n^r))+s[9]+568446438&4294967295,e=n+(o<<5&4294967295|o>>>27),o=i+(n^r&(e^n))+s[14]+3275163606&4294967295,i=e+(o<<9&4294967295|o>>>23),o=r+(e^n&(i^e))+s[3]+4107603335&4294967295,r=i+(o<<14&4294967295|o>>>18),o=n+(i^e&(r^i))+s[8]+1163531501&4294967295,n=r+(o<<20&4294967295|o>>>12),o=e+(r^i&(n^r))+s[13]+2850285829&4294967295,e=n+(o<<5&4294967295|o>>>27),o=i+(n^r&(e^n))+s[2]+4243563512&4294967295,i=e+(o<<9&4294967295|o>>>23),o=r+(e^n&(i^e))+s[7]+1735328473&4294967295,r=i+(o<<14&4294967295|o>>>18),o=n+(i^e&(r^i))+s[12]+2368359562&4294967295,n=r+(o<<20&4294967295|o>>>12),o=e+(n^r^i)+s[5]+4294588738&4294967295,e=n+(o<<4&4294967295|o>>>28),o=i+(e^n^r)+s[8]+2272392833&4294967295,i=e+(o<<11&4294967295|o>>>21),o=r+(i^e^n)+s[11]+1839030562&4294967295,r=i+(o<<16&4294967295|o>>>16),o=n+(r^i^e)+s[14]+4259657740&4294967295,n=r+(o<<23&4294967295|o>>>9),o=e+(n^r^i)+s[1]+2763975236&4294967295,e=n+(o<<4&4294967295|o>>>28),o=i+(e^n^r)+s[4]+1272893353&4294967295,i=e+(o<<11&4294967295|o>>>21),o=r+(i^e^n)+s[7]+4139469664&4294967295,r=i+(o<<16&4294967295|o>>>16),o=n+(r^i^e)+s[10]+3200236656&4294967295,n=r+(o<<23&4294967295|o>>>9),o=e+(n^r^i)+s[13]+681279174&4294967295,e=n+(o<<4&4294967295|o>>>28),o=i+(e^n^r)+s[0]+3936430074&4294967295,i=e+(o<<11&4294967295|o>>>21),o=r+(i^e^n)+s[3]+3572445317&4294967295,r=i+(o<<16&4294967295|o>>>16),o=n+(r^i^e)+s[6]+76029189&4294967295,n=r+(o<<23&4294967295|o>>>9),o=e+(n^r^i)+s[9]+3654602809&4294967295,e=n+(o<<4&4294967295|o>>>28),o=i+(e^n^r)+s[12]+3873151461&4294967295,i=e+(o<<11&4294967295|o>>>21),o=r+(i^e^n)+s[15]+530742520&4294967295,r=i+(o<<16&4294967295|o>>>16),o=n+(r^i^e)+s[2]+3299628645&4294967295,n=r+(o<<23&4294967295|o>>>9),o=e+(r^(n|~i))+s[0]+4096336452&4294967295,e=n+(o<<6&4294967295|o>>>26),o=i+(n^(e|~r))+s[7]+1126891415&4294967295,i=e+(o<<10&4294967295|o>>>22),o=r+(e^(i|~n))+s[14]+2878612391&4294967295,r=i+(o<<15&4294967295|o>>>17),o=n+(i^(r|~e))+s[5]+4237533241&4294967295,n=r+(o<<21&4294967295|o>>>11),o=e+(r^(n|~i))+s[12]+1700485571&4294967295,e=n+(o<<6&4294967295|o>>>26),o=i+(n^(e|~r))+s[3]+2399980690&4294967295,i=e+(o<<10&4294967295|o>>>22),o=r+(e^(i|~n))+s[10]+4293915773&4294967295,r=i+(o<<15&4294967295|o>>>17),o=n+(i^(r|~e))+s[1]+2240044497&4294967295,n=r+(o<<21&4294967295|o>>>11),o=e+(r^(n|~i))+s[8]+1873313359&4294967295,e=n+(o<<6&4294967295|o>>>26),o=i+(n^(e|~r))+s[15]+4264355552&4294967295,i=e+(o<<10&4294967295|o>>>22),o=r+(e^(i|~n))+s[6]+2734768916&4294967295,r=i+(o<<15&4294967295|o>>>17),o=n+(i^(r|~e))+s[13]+1309151649&4294967295,n=r+(o<<21&4294967295|o>>>11),o=e+(r^(n|~i))+s[4]+4149444226&4294967295,e=n+(o<<6&4294967295|o>>>26),o=i+(n^(e|~r))+s[11]+3174756917&4294967295,i=e+(o<<10&4294967295|o>>>22),o=r+(e^(i|~n))+s[2]+718787259&4294967295,r=i+(o<<15&4294967295|o>>>17),o=n+(i^(r|~e))+s[9]+3951481745&4294967295,t.g[0]=t.g[0]+e&4294967295,t.g[1]=t.g[1]+(r+(o<<21&4294967295|o>>>11))&4294967295,t.g[2]=t.g[2]+r&4294967295,t.g[3]=t.g[3]+i&4294967295}Ie.prototype.j=function(t,e){e===void 0&&(e=t.length);for(var n=e-this.blockSize,s=this.m,r=this.h,i=0;i<e;){if(r==0)for(;i<=n;)ai(this,t,i),i+=this.blockSize;if(typeof t=="string"){for(;i<e;)if(s[r++]=t.charCodeAt(i++),r==this.blockSize){ai(this,s),r=0;break}}else for(;i<e;)if(s[r++]=t[i++],r==this.blockSize){ai(this,s),r=0;break}}this.h=r,this.i+=e};Ie.prototype.l=function(){var t=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);t[0]=128;for(var e=1;e<t.length-8;++e)t[e]=0;var n=8*this.i;for(e=t.length-8;e<t.length;++e)t[e]=n&255,n/=256;for(this.j(t),t=Array(16),e=n=0;4>e;++e)for(var s=0;32>s;s+=8)t[n++]=this.g[e]>>>s&255;return t};function x(t,e){this.h=e;for(var n=[],s=!0,r=t.length-1;0<=r;r--){var i=t[r]|0;s&&i==e||(n[r]=i,s=!1)}this.g=n}var Jm={};function Ro(t){return-128<=t&&128>t?im(t,function(e){return new x([e|0],0>e?-1:0)}):new x([t|0],0>t?-1:0)}function Re(t){if(isNaN(t)||!isFinite(t))return Ht;if(0>t)return Z(Re(-t));for(var e=[],n=1,s=0;t>=n;s++)e[s]=t/n|0,n*=Mi;return new x(e,0)}function Bl(t,e){if(t.length==0)throw Error("number format error: empty string");if(e=e||10,2>e||36<e)throw Error("radix out of range: "+e);if(t.charAt(0)=="-")return Z(Bl(t.substring(1),e));if(0<=t.indexOf("-"))throw Error('number format error: interior "-" character');for(var n=Re(Math.pow(e,8)),s=Ht,r=0;r<t.length;r+=8){var i=Math.min(8,t.length-r),o=parseInt(t.substring(r,r+i),e);8>i?(i=Re(Math.pow(e,i)),s=s.R(i).add(Re(o))):(s=s.R(n),s=s.add(Re(o)))}return s}var Mi=4294967296,Ht=Ro(0),Li=Ro(1),tc=Ro(16777216);m=x.prototype;m.ea=function(){if(Te(this))return-Z(this).ea();for(var t=0,e=1,n=0;n<this.g.length;n++){var s=this.D(n);t+=(0<=s?s:Mi+s)*e,e*=Mi}return t};m.toString=function(t){if(t=t||10,2>t||36<t)throw Error("radix out of range: "+t);if(je(this))return"0";if(Te(this))return"-"+Z(this).toString(t);for(var e=Re(Math.pow(t,6)),n=this,s="";;){var r=Ys(n,e).g;n=Xs(n,r.R(e));var i=((0<n.g.length?n.g[0]:n.h)>>>0).toString(t);if(n=r,je(n))return i+s;for(;6>i.length;)i="0"+i;s=i+s}};m.D=function(t){return 0>t?0:t<this.g.length?this.g[t]:this.h};function je(t){if(t.h!=0)return!1;for(var e=0;e<t.g.length;e++)if(t.g[e]!=0)return!1;return!0}function Te(t){return t.h==-1}m.X=function(t){return t=Xs(this,t),Te(t)?-1:je(t)?0:1};function Z(t){for(var e=t.g.length,n=[],s=0;s<e;s++)n[s]=~t.g[s];return new x(n,~t.h).add(Li)}m.abs=function(){return Te(this)?Z(this):this};m.add=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0,r=0;r<=e;r++){var i=s+(this.D(r)&65535)+(t.D(r)&65535),o=(i>>>16)+(this.D(r)>>>16)+(t.D(r)>>>16);s=o>>>16,i&=65535,o&=65535,n[r]=o<<16|i}return new x(n,n[n.length-1]&-2147483648?-1:0)};function Xs(t,e){return t.add(Z(e))}m.R=function(t){if(je(this)||je(t))return Ht;if(Te(this))return Te(t)?Z(this).R(Z(t)):Z(Z(this).R(t));if(Te(t))return Z(this.R(Z(t)));if(0>this.X(tc)&&0>t.X(tc))return Re(this.ea()*t.ea());for(var e=this.g.length+t.g.length,n=[],s=0;s<2*e;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(var r=0;r<t.g.length;r++){var i=this.D(s)>>>16,o=this.D(s)&65535,a=t.D(r)>>>16,c=t.D(r)&65535;n[2*s+2*r]+=o*c,Ts(n,2*s+2*r),n[2*s+2*r+1]+=i*c,Ts(n,2*s+2*r+1),n[2*s+2*r+1]+=o*a,Ts(n,2*s+2*r+1),n[2*s+2*r+2]+=i*a,Ts(n,2*s+2*r+2)}for(s=0;s<e;s++)n[s]=n[2*s+1]<<16|n[2*s];for(s=e;s<2*e;s++)n[s]=0;return new x(n,0)};function Ts(t,e){for(;(t[e]&65535)!=t[e];)t[e+1]+=t[e]>>>16,t[e]&=65535,e++}function _n(t,e){this.g=t,this.h=e}function Ys(t,e){if(je(e))throw Error("division by zero");if(je(t))return new _n(Ht,Ht);if(Te(t))return e=Ys(Z(t),e),new _n(Z(e.g),Z(e.h));if(Te(e))return e=Ys(t,Z(e)),new _n(Z(e.g),e.h);if(30<t.g.length){if(Te(t)||Te(e))throw Error("slowDivide_ only works with positive integers.");for(var n=Li,s=e;0>=s.X(t);)n=nc(n),s=nc(s);var r=Ut(n,1),i=Ut(s,1);for(s=Ut(s,2),n=Ut(n,2);!je(s);){var o=i.add(s);0>=o.X(t)&&(r=r.add(n),i=o),s=Ut(s,1),n=Ut(n,1)}return e=Xs(t,r.R(e)),new _n(r,e)}for(r=Ht;0<=t.X(e);){for(n=Math.max(1,Math.floor(t.ea()/e.ea())),s=Math.ceil(Math.log(n)/Math.LN2),s=48>=s?1:Math.pow(2,s-48),i=Re(n),o=i.R(e);Te(o)||0<o.X(t);)n-=s,i=Re(n),o=i.R(e);je(i)&&(i=Li),r=r.add(i),t=Xs(t,o)}return new _n(r,t)}m.gb=function(t){return Ys(this,t).h};m.and=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.D(s)&t.D(s);return new x(n,this.h&t.h)};m.or=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.D(s)|t.D(s);return new x(n,this.h|t.h)};m.xor=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.D(s)^t.D(s);return new x(n,this.h^t.h)};function nc(t){for(var e=t.g.length+1,n=[],s=0;s<e;s++)n[s]=t.D(s)<<1|t.D(s-1)>>>31;return new x(n,t.h)}function Ut(t,e){var n=e>>5;e%=32;for(var s=t.g.length-n,r=[],i=0;i<s;i++)r[i]=0<e?t.D(i+n)>>>e|t.D(i+n+1)<<32-e:t.D(i+n);return new x(r,t.h)}Qs.prototype.createWebChannel=Qs.prototype.g;Ee.prototype.send=Ee.prototype.u;Ee.prototype.open=Ee.prototype.m;Ee.prototype.close=Ee.prototype.close;wr.NO_ERROR=0;wr.TIMEOUT=8;wr.HTTP_ERROR=6;rl.COMPLETE="complete";il.EventType=ns;ns.OPEN="a";ns.CLOSE="b";ns.ERROR="c";ns.MESSAGE="d";X.prototype.listen=X.prototype.O;z.prototype.listenOnce=z.prototype.P;z.prototype.getLastError=z.prototype.Sa;z.prototype.getLastErrorCode=z.prototype.Ia;z.prototype.getStatus=z.prototype.da;z.prototype.getResponseJson=z.prototype.Wa;z.prototype.getResponseText=z.prototype.ja;z.prototype.send=z.prototype.ha;z.prototype.setWithCredentials=z.prototype.Oa;Ie.prototype.digest=Ie.prototype.l;Ie.prototype.reset=Ie.prototype.reset;Ie.prototype.update=Ie.prototype.j;x.prototype.add=x.prototype.add;x.prototype.multiply=x.prototype.R;x.prototype.modulo=x.prototype.gb;x.prototype.compare=x.prototype.X;x.prototype.toNumber=x.prototype.ea;x.prototype.toString=x.prototype.toString;x.prototype.getBits=x.prototype.D;x.fromNumber=Re;x.fromString=Bl;var Zm=function(){return new Qs},ey=function(){return _r()},ci=wr,ty=rl,ny=Pt,sc={xb:0,Ab:1,Bb:2,Ub:3,Zb:4,Wb:5,Xb:6,Vb:7,Tb:8,Yb:9,PROXY:10,NOPROXY:11,Rb:12,Nb:13,Ob:14,Mb:15,Pb:16,Qb:17,tb:18,sb:19,ub:20},sy=is,Is=il,ry=z,iy=Ie,Kt=x;const rc="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}re.UNAUTHENTICATED=new re(null),re.GOOGLE_CREDENTIALS=new re("google-credentials-uid"),re.FIRST_PARTY=new re("first-party-uid"),re.MOCK_USER=new re("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cn="9.23.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const At=new Yi("@firebase/firestore");function ic(){return At.logLevel}function E(t,...e){if(At.logLevel<=D.DEBUG){const n=e.map(No);At.debug(`Firestore (${cn}): ${t}`,...n)}}function Qe(t,...e){if(At.logLevel<=D.ERROR){const n=e.map(No);At.error(`Firestore (${cn}): ${t}`,...n)}}function Ct(t,...e){if(At.logLevel<=D.WARN){const n=e.map(No);At.warn(`Firestore (${cn}): ${t}`,...n)}}function No(t){if(typeof t=="string")return t;try{return e=t,JSON.stringify(e)}catch{return t}/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function I(t="Unexpected state"){const e=`FIRESTORE (${cn}) INTERNAL ASSERTION FAILED: `+t;throw Qe(e),new Error(e)}function B(t,e){t||I()}function C(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class v extends Ue{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $l{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ql{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(re.UNAUTHENTICATED))}shutdown(){}}class oy{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class ay{constructor(e){this.t=e,this.currentUser=re.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){let s=this.i;const r=c=>this.i!==s?(s=this.i,n(c)):Promise.resolve();let i=new ze;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new ze,e.enqueueRetryable(()=>r(this.currentUser))};const o=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await r(this.currentUser)})},a=c=>{E("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.auth.addAuthTokenListener(this.o),o()};this.t.onInit(c=>a(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?a(c):(E("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new ze)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(s=>this.i!==e?(E("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(B(typeof s.accessToken=="string"),new $l(s.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.auth.removeAuthTokenListener(this.o)}u(){const e=this.auth&&this.auth.getUid();return B(e===null||typeof e=="string"),new re(e)}}class cy{constructor(e,n,s){this.h=e,this.l=n,this.m=s,this.type="FirstParty",this.user=re.FIRST_PARTY,this.g=new Map}p(){return this.m?this.m():null}get headers(){this.g.set("X-Goog-AuthUser",this.h);const e=this.p();return e&&this.g.set("Authorization",e),this.l&&this.g.set("X-Goog-Iam-Authorization-Token",this.l),this.g}}class uy{constructor(e,n,s){this.h=e,this.l=n,this.m=s}getToken(){return Promise.resolve(new cy(this.h,this.l,this.m))}start(e,n){e.enqueueRetryable(()=>n(re.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class ly{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class hy{constructor(e){this.I=e,this.forceRefresh=!1,this.appCheck=null,this.T=null}start(e,n){const s=i=>{i.error!=null&&E("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.T;return this.T=i.token,E("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>s(i))};const r=i=>{E("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.appCheck.addTokenListener(this.o)};this.I.onInit(i=>r(i)),setTimeout(()=>{if(!this.appCheck){const i=this.I.getImmediate({optional:!0});i?r(i):E("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(B(typeof n.token=="string"),this.T=n.token,new ly(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.appCheck.removeTokenListener(this.o)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dy(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let s=0;s<t;s++)n[s]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jl{static A(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let s="";for(;s.length<20;){const r=dy(40);for(let i=0;i<r.length;++i)s.length<20&&r[i]<n&&(s+=e.charAt(r[i]%e.length))}return s}}function L(t,e){return t<e?-1:t>e?1:0}function Jt(t,e,n){return t.length===e.length&&t.every((s,r)=>n(s,e[r]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new v(f.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new v(f.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new v(f.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new v(f.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return W.fromMillis(Date.now())}static fromDate(e){return W.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),s=Math.floor(1e6*(e-1e3*n));return new W(n,s)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?L(this.nanoseconds,e.nanoseconds):L(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b{constructor(e){this.timestamp=e}static fromTimestamp(e){return new b(e)}static min(){return new b(new W(0,0))}static max(){return new b(new W(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(e,n,s){n===void 0?n=0:n>e.length&&I(),s===void 0?s=e.length-n:s>e.length-n&&I(),this.segments=e,this.offset=n,this.len=s}get length(){return this.len}isEqual(e){return jn.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof jn?e.forEach(s=>{n.push(s)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,s=this.limit();n<s;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const s=Math.min(e.length,n.length);for(let r=0;r<s;r++){const i=e.get(r),o=n.get(r);if(i<o)return-1;if(i>o)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class V extends jn{construct(e,n,s){return new V(e,n,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}static fromString(...e){const n=[];for(const s of e){if(s.indexOf("//")>=0)throw new v(f.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);n.push(...s.split("/").filter(r=>r.length>0))}return new V(n)}static emptyPath(){return new V([])}}const fy=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ee extends jn{construct(e,n,s){return new ee(e,n,s)}static isValidIdentifier(e){return fy.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ee.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ee(["__name__"])}static fromServerFormat(e){const n=[];let s="",r=0;const i=()=>{if(s.length===0)throw new v(f.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(s),s=""};let o=!1;for(;r<e.length;){const a=e[r];if(a==="\\"){if(r+1===e.length)throw new v(f.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[r+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new v(f.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=c,r+=2}else a==="`"?(o=!o,r++):a!=="."||o?(s+=a,r++):(i(),r++)}if(i(),o)throw new v(f.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ee(n)}static emptyPath(){return new ee([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T{constructor(e){this.path=e}static fromPath(e){return new T(V.fromString(e))}static fromName(e){return new T(V.fromString(e).popFirst(5))}static empty(){return new T(V.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&V.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return V.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new T(new V(e.slice()))}}function py(t,e){const n=t.toTimestamp().seconds,s=t.toTimestamp().nanoseconds+1,r=b.fromTimestamp(s===1e9?new W(n+1,0):new W(n,s));return new ut(r,T.empty(),e)}function gy(t){return new ut(t.readTime,t.key,-1)}class ut{constructor(e,n,s){this.readTime=e,this.documentKey=n,this.largestBatchId=s}static min(){return new ut(b.min(),T.empty(),-1)}static max(){return new ut(b.max(),T.empty(),-1)}}function my(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=T.comparator(t.documentKey,e.documentKey),n!==0?n:L(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yy="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class vy{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cs(t){if(t.code!==f.FAILED_PRECONDITION||t.message!==yy)throw t;E("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&I(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new g((s,r)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(s,r)},this.catchCallback=i=>{this.wrapFailure(n,i).next(s,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof g?n:g.resolve(n)}catch(n){return g.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):g.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):g.reject(n)}static resolve(e){return new g((n,s)=>{n(e)})}static reject(e){return new g((n,s)=>{s(e)})}static waitFor(e){return new g((n,s)=>{let r=0,i=0,o=!1;e.forEach(a=>{++r,a.next(()=>{++i,o&&i===r&&n()},c=>s(c))}),o=!0,i===r&&n()})}static or(e){let n=g.resolve(!1);for(const s of e)n=n.next(r=>r?g.resolve(r):s());return n}static forEach(e,n){const s=[];return e.forEach((r,i)=>{s.push(n.call(this,r,i))}),this.waitFor(s)}static mapArray(e,n){return new g((s,r)=>{const i=e.length,o=new Array(i);let a=0;for(let c=0;c<i;c++){const u=c;n(e[u]).next(l=>{o[u]=l,++a,a===i&&s(o)},l=>r(l))}})}static doWhile(e,n){return new g((s,r)=>{const i=()=>{e()===!0?n().next(()=>{i()},r):s()};i()})}}function us(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=s=>this.ot(s),this.ut=s=>n.writeSequenceNumber(s))}ot(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ut&&this.ut(e),e}}Do.ct=-1;function kr(t){return t==null}function Js(t){return t===0&&1/t==-1/0}function _y(t){return typeof t=="number"&&Number.isInteger(t)&&!Js(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oc(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Mt(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function zl(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{constructor(e,n){this.comparator=e,this.root=n||J.EMPTY}insert(e,n){return new q(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,J.BLACK,null,null))}remove(e){return new q(this.comparator,this.root.remove(e,this.comparator).copy(null,null,J.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return n.value;s<0?n=n.left:s>0&&(n=n.right)}return null}indexOf(e){let n=0,s=this.root;for(;!s.isEmpty();){const r=this.comparator(e,s.key);if(r===0)return n+s.left.size;r<0?s=s.left:(n+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,s)=>(e(n,s),!1))}toString(){const e=[];return this.inorderTraversal((n,s)=>(e.push(`${n}:${s}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ss(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ss(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ss(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ss(this.root,e,this.comparator,!0)}}class Ss{constructor(e,n,s,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?s(e.key,n):1,n&&r&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class J{constructor(e,n,s,r,i){this.key=e,this.value=n,this.color=s??J.RED,this.left=r??J.EMPTY,this.right=i??J.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,s,r,i){return new J(e??this.key,n??this.value,s??this.color,r??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,s){let r=this;const i=s(e,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(e,n,s),null):i===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,s)),r.fixUp()}removeMin(){if(this.left.isEmpty())return J.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let s,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return J.EMPTY;s=r.right.min(),r=r.copy(s.key,s.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,J.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,J.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw I();const e=this.left.check();if(e!==this.right.check())throw I();return e+(this.isRed()?0:1)}}J.EMPTY=null,J.RED=!0,J.BLACK=!1;J.EMPTY=new class{constructor(){this.size=0}get key(){throw I()}get value(){throw I()}get color(){throw I()}get left(){throw I()}get right(){throw I()}copy(t,e,n,s,r){return this}insert(t,e,n){return new J(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(e){this.comparator=e,this.data=new q(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,s)=>(e(n),!1))}forEachInRange(e,n){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const r=s.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let s;for(s=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new ac(this.data.getIterator())}getIteratorFrom(e){return new ac(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(s=>{n=n.add(s)}),n}isEqual(e){if(!(e instanceof ce)||this.size!==e.size)return!1;const n=this.data.getIterator(),s=e.data.getIterator();for(;n.hasNext();){const r=n.getNext().key,i=s.getNext().key;if(this.comparator(r,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new ce(this.comparator);return n.data=e,n}}class ac{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(e){this.fields=e,e.sort(ee.comparator)}static empty(){return new _e([])}unionWith(e){let n=new ce(ee.comparator);for(const s of this.fields)n=n.add(s);for(const s of e)n=n.add(s);return new _e(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Jt(this.fields,e.fields,(n,s)=>n.isEqual(s))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(r){throw typeof DOMException<"u"&&r instanceof DOMException?new Hl("Invalid base64 string: "+r):r}}(e);return new he(n)}static fromUint8Array(e){const n=function(s){let r="";for(let i=0;i<s.length;++i)r+=String.fromCharCode(s[i]);return r}(e);return new he(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return L(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}he.EMPTY_BYTE_STRING=new he("");const wy=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function lt(t){if(B(!!t),typeof t=="string"){let e=0;const n=wy.exec(t);if(B(!!n),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}const s=new Date(t);return{seconds:Math.floor(s.getTime()/1e3),nanos:e}}return{seconds:K(t.seconds),nanos:K(t.nanos)}}function K(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function kt(t){return typeof t=="string"?he.fromBase64String(t):he.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oo(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function Po(t){const e=t.mapValue.fields.__previous_value__;return Oo(e)?Po(e):e}function zn(t){const e=lt(t.mapValue.fields.__local_write_time__.timestampValue);return new W(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ey{constructor(e,n,s,r,i,o,a,c,u){this.databaseId=e,this.appId=n,this.persistenceKey=s,this.host=r,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=u}}class Zt{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new Zt("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Zt&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bs={mapValue:{}};function Rt(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Oo(t)?4:Ty(t)?9007199254740991:10:I()}function xe(t,e){if(t===e)return!0;const n=Rt(t);if(n!==Rt(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return zn(t).isEqual(zn(e));case 3:return function(s,r){if(typeof s.timestampValue=="string"&&typeof r.timestampValue=="string"&&s.timestampValue.length===r.timestampValue.length)return s.timestampValue===r.timestampValue;const i=lt(s.timestampValue),o=lt(r.timestampValue);return i.seconds===o.seconds&&i.nanos===o.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,r){return kt(s.bytesValue).isEqual(kt(r.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,r){return K(s.geoPointValue.latitude)===K(r.geoPointValue.latitude)&&K(s.geoPointValue.longitude)===K(r.geoPointValue.longitude)}(t,e);case 2:return function(s,r){if("integerValue"in s&&"integerValue"in r)return K(s.integerValue)===K(r.integerValue);if("doubleValue"in s&&"doubleValue"in r){const i=K(s.doubleValue),o=K(r.doubleValue);return i===o?Js(i)===Js(o):isNaN(i)&&isNaN(o)}return!1}(t,e);case 9:return Jt(t.arrayValue.values||[],e.arrayValue.values||[],xe);case 10:return function(s,r){const i=s.mapValue.fields||{},o=r.mapValue.fields||{};if(oc(i)!==oc(o))return!1;for(const a in i)if(i.hasOwnProperty(a)&&(o[a]===void 0||!xe(i[a],o[a])))return!1;return!0}(t,e);default:return I()}}function Hn(t,e){return(t.values||[]).find(n=>xe(n,e))!==void 0}function en(t,e){if(t===e)return 0;const n=Rt(t),s=Rt(e);if(n!==s)return L(n,s);switch(n){case 0:case 9007199254740991:return 0;case 1:return L(t.booleanValue,e.booleanValue);case 2:return function(r,i){const o=K(r.integerValue||r.doubleValue),a=K(i.integerValue||i.doubleValue);return o<a?-1:o>a?1:o===a?0:isNaN(o)?isNaN(a)?0:-1:1}(t,e);case 3:return cc(t.timestampValue,e.timestampValue);case 4:return cc(zn(t),zn(e));case 5:return L(t.stringValue,e.stringValue);case 6:return function(r,i){const o=kt(r),a=kt(i);return o.compareTo(a)}(t.bytesValue,e.bytesValue);case 7:return function(r,i){const o=r.split("/"),a=i.split("/");for(let c=0;c<o.length&&c<a.length;c++){const u=L(o[c],a[c]);if(u!==0)return u}return L(o.length,a.length)}(t.referenceValue,e.referenceValue);case 8:return function(r,i){const o=L(K(r.latitude),K(i.latitude));return o!==0?o:L(K(r.longitude),K(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return function(r,i){const o=r.values||[],a=i.values||[];for(let c=0;c<o.length&&c<a.length;++c){const u=en(o[c],a[c]);if(u)return u}return L(o.length,a.length)}(t.arrayValue,e.arrayValue);case 10:return function(r,i){if(r===bs.mapValue&&i===bs.mapValue)return 0;if(r===bs.mapValue)return 1;if(i===bs.mapValue)return-1;const o=r.fields||{},a=Object.keys(o),c=i.fields||{},u=Object.keys(c);a.sort(),u.sort();for(let l=0;l<a.length&&l<u.length;++l){const h=L(a[l],u[l]);if(h!==0)return h;const d=en(o[a[l]],c[u[l]]);if(d!==0)return d}return L(a.length,u.length)}(t.mapValue,e.mapValue);default:throw I()}}function cc(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return L(t,e);const n=lt(t),s=lt(e),r=L(n.seconds,s.seconds);return r!==0?r:L(n.nanos,s.nanos)}function tn(t){return xi(t)}function xi(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(s){const r=lt(s);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?kt(t.bytesValue).toBase64():"referenceValue"in t?(n=t.referenceValue,T.fromName(n).toString()):"geoPointValue"in t?`geo(${(e=t.geoPointValue).latitude},${e.longitude})`:"arrayValue"in t?function(s){let r="[",i=!0;for(const o of s.values||[])i?i=!1:r+=",",r+=xi(o);return r+"]"}(t.arrayValue):"mapValue"in t?function(s){const r=Object.keys(s.fields||{}).sort();let i="{",o=!0;for(const a of r)o?o=!1:i+=",",i+=`${a}:${xi(s.fields[a])}`;return i+"}"}(t.mapValue):I();var e,n}function uc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Ui(t){return!!t&&"integerValue"in t}function Mo(t){return!!t&&"arrayValue"in t}function lc(t){return!!t&&"nullValue"in t}function hc(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Ms(t){return!!t&&"mapValue"in t}function Cn(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Mt(t.mapValue.fields,(n,s)=>e.mapValue.fields[n]=Cn(s)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Cn(t.arrayValue.values[n]);return e}return Object.assign({},t)}function Ty(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(e){this.value=e}static empty(){return new ve({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let s=0;s<e.length-1;++s)if(n=(n.mapValue.fields||{})[e.get(s)],!Ms(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Cn(n)}setAll(e){let n=ee.emptyPath(),s={},r=[];e.forEach((o,a)=>{if(!n.isImmediateParentOf(a)){const c=this.getFieldsMap(n);this.applyChanges(c,s,r),s={},r=[],n=a.popLast()}o?s[a.lastSegment()]=Cn(o):r.push(a.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,s,r)}delete(e){const n=this.field(e.popLast());Ms(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return xe(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let s=0;s<e.length;++s){let r=n.mapValue.fields[e.get(s)];Ms(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(s)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,s){Mt(n,(r,i)=>e[r]=i);for(const r of s)delete e[r]}clone(){return new ve(Cn(this.value))}}function Kl(t){const e=[];return Mt(t.fields,(n,s)=>{const r=new ee([n]);if(Ms(s)){const i=Kl(s.mapValue).fields;if(i.length===0)e.push(r);else for(const o of i)e.push(r.child(o))}else e.push(r)}),new _e(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e,n,s,r,i,o,a){this.key=e,this.documentType=n,this.version=s,this.readTime=r,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new ie(e,0,b.min(),b.min(),b.min(),ve.empty(),0)}static newFoundDocument(e,n,s,r){return new ie(e,1,n,b.min(),s,r,0)}static newNoDocument(e,n){return new ie(e,2,n,b.min(),b.min(),ve.empty(),0)}static newUnknownDocument(e,n){return new ie(e,3,n,b.min(),b.min(),ve.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(b.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ve.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ve.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=b.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ie&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ie(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zs{constructor(e,n){this.position=e,this.inclusive=n}}function dc(t,e,n){let s=0;for(let r=0;r<t.position.length;r++){const i=e[r],o=t.position[r];if(i.field.isKeyField()?s=T.comparator(T.fromName(o.referenceValue),n.key):s=en(o,n.data.field(i.field)),i.dir==="desc"&&(s*=-1),s!==0)break}return s}function fc(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!xe(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e,n="asc"){this.field=e,this.dir=n}}function Iy(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gl{}class G extends Gl{constructor(e,n,s){super(),this.field=e,this.op=n,this.value=s}static create(e,n,s){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,s):new by(e,n,s):n==="array-contains"?new ky(e,s):n==="in"?new Ry(e,s):n==="not-in"?new Ny(e,s):n==="array-contains-any"?new Dy(e,s):new G(e,n,s)}static createKeyFieldInFilter(e,n,s){return n==="in"?new Ay(e,s):new Cy(e,s)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(en(n,this.value)):n!==null&&Rt(this.value)===Rt(n)&&this.matchesComparison(en(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return I()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}getFirstInequalityField(){return this.isInequality()?this.field:null}}class Se extends Gl{constructor(e,n){super(),this.filters=e,this.op=n,this.lt=null}static create(e,n){return new Se(e,n)}matches(e){return Wl(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.lt!==null||(this.lt=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.lt}getFilters(){return Object.assign([],this.filters)}getFirstInequalityField(){const e=this.ft(n=>n.isInequality());return e!==null?e.field:null}ft(e){for(const n of this.getFlattenedFilters())if(e(n))return n;return null}}function Wl(t){return t.op==="and"}function Ql(t){return Sy(t)&&Wl(t)}function Sy(t){for(const e of t.filters)if(e instanceof Se)return!1;return!0}function Fi(t){if(t instanceof G)return t.field.canonicalString()+t.op.toString()+tn(t.value);if(Ql(t))return t.filters.map(e=>Fi(e)).join(",");{const e=t.filters.map(n=>Fi(n)).join(",");return`${t.op}(${e})`}}function Xl(t,e){return t instanceof G?function(n,s){return s instanceof G&&n.op===s.op&&n.field.isEqual(s.field)&&xe(n.value,s.value)}(t,e):t instanceof Se?function(n,s){return s instanceof Se&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((r,i,o)=>r&&Xl(i,s.filters[o]),!0):!1}(t,e):void I()}function Yl(t){return t instanceof G?function(e){return`${e.field.canonicalString()} ${e.op} ${tn(e.value)}`}(t):t instanceof Se?function(e){return e.op.toString()+" {"+e.getFilters().map(Yl).join(" ,")+"}"}(t):"Filter"}class by extends G{constructor(e,n,s){super(e,n,s),this.key=T.fromName(s.referenceValue)}matches(e){const n=T.comparator(e.key,this.key);return this.matchesComparison(n)}}class Ay extends G{constructor(e,n){super(e,"in",n),this.keys=Jl("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class Cy extends G{constructor(e,n){super(e,"not-in",n),this.keys=Jl("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function Jl(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(s=>T.fromName(s.referenceValue))}class ky extends G{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Mo(n)&&Hn(n.arrayValue,this.value)}}class Ry extends G{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Hn(this.value.arrayValue,n)}}class Ny extends G{constructor(e,n){super(e,"not-in",n)}matches(e){if(Hn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!Hn(this.value.arrayValue,n)}}class Dy extends G{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Mo(n)||!n.arrayValue.values)&&n.arrayValue.values.some(s=>Hn(this.value.arrayValue,s))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oy{constructor(e,n=null,s=[],r=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=n,this.orderBy=s,this.filters=r,this.limit=i,this.startAt=o,this.endAt=a,this.dt=null}}function pc(t,e=null,n=[],s=[],r=null,i=null,o=null){return new Oy(t,e,n,s,r,i,o)}function Lo(t){const e=C(t);if(e.dt===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(s=>Fi(s)).join(","),n+="|ob:",n+=e.orderBy.map(s=>function(r){return r.field.canonicalString()+r.dir}(s)).join(","),kr(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>tn(s)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>tn(s)).join(",")),e.dt=n}return e.dt}function xo(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Iy(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!Xl(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!fc(t.startAt,e.startAt)&&fc(t.endAt,e.endAt)}function Vi(t){return T.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e,n=null,s=[],r=[],i=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=s,this.filters=r,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=c,this.wt=null,this._t=null,this.startAt,this.endAt}}function Py(t,e,n,s,r,i,o,a){return new un(t,e,n,s,r,i,o,a)}function Rr(t){return new un(t)}function gc(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function Uo(t){return t.explicitOrderBy.length>0?t.explicitOrderBy[0].field:null}function Nr(t){for(const e of t.filters){const n=e.getFirstInequalityField();if(n!==null)return n}return null}function Zl(t){return t.collectionGroup!==null}function Wt(t){const e=C(t);if(e.wt===null){e.wt=[];const n=Nr(e),s=Uo(e);if(n!==null&&s===null)n.isKeyField()||e.wt.push(new Gt(n)),e.wt.push(new Gt(ee.keyField(),"asc"));else{let r=!1;for(const i of e.explicitOrderBy)e.wt.push(i),i.field.isKeyField()&&(r=!0);if(!r){const i=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";e.wt.push(new Gt(ee.keyField(),i))}}}return e.wt}function Xe(t){const e=C(t);if(!e._t)if(e.limitType==="F")e._t=pc(e.path,e.collectionGroup,Wt(e),e.filters,e.limit,e.startAt,e.endAt);else{const n=[];for(const i of Wt(e)){const o=i.dir==="desc"?"asc":"desc";n.push(new Gt(i.field,o))}const s=e.endAt?new Zs(e.endAt.position,e.endAt.inclusive):null,r=e.startAt?new Zs(e.startAt.position,e.startAt.inclusive):null;e._t=pc(e.path,e.collectionGroup,n,e.filters,e.limit,s,r)}return e._t}function Bi(t,e){e.getFirstInequalityField(),Nr(t);const n=t.filters.concat([e]);return new un(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function $i(t,e,n){return new un(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Dr(t,e){return xo(Xe(t),Xe(e))&&t.limitType===e.limitType}function eh(t){return`${Lo(Xe(t))}|lt:${t.limitType}`}function qi(t){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(s=>Yl(s)).join(", ")}]`),kr(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(s=>function(r){return`${r.field.canonicalString()} (${r.dir})`}(s)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>tn(s)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>tn(s)).join(",")),`Target(${n})`}(Xe(t))}; limitType=${t.limitType})`}function Or(t,e){return e.isFoundDocument()&&function(n,s){const r=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(r):T.isDocumentKey(n.path)?n.path.isEqual(r):n.path.isImmediateParentOf(r)}(t,e)&&function(n,s){for(const r of Wt(n))if(!r.field.isKeyField()&&s.data.field(r.field)===null)return!1;return!0}(t,e)&&function(n,s){for(const r of n.filters)if(!r.matches(s))return!1;return!0}(t,e)&&function(n,s){return!(n.startAt&&!function(r,i,o){const a=dc(r,i,o);return r.inclusive?a<=0:a<0}(n.startAt,Wt(n),s)||n.endAt&&!function(r,i,o){const a=dc(r,i,o);return r.inclusive?a>=0:a>0}(n.endAt,Wt(n),s))}(t,e)}function My(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function th(t){return(e,n)=>{let s=!1;for(const r of Wt(t)){const i=Ly(r,e,n);if(i!==0)return i;s=s||r.field.isKeyField()}return 0}}function Ly(t,e,n){const s=t.field.isKeyField()?T.comparator(e.key,n.key):function(r,i,o){const a=i.data.field(r),c=o.data.field(r);return a!==null&&c!==null?en(a,c):I()}(t.field,e,n);switch(t.dir){case"asc":return s;case"desc":return-1*s;default:return I()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),s=this.inner[n];if(s!==void 0){for(const[r,i]of s)if(this.equalsFn(r,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const s=this.mapKeyFn(e),r=this.inner[s];if(r===void 0)return this.inner[s]=[[e,n]],void this.innerSize++;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return void(r[i]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return!1;for(let r=0;r<s.length;r++)if(this.equalsFn(s[r][0],e))return s.length===1?delete this.inner[n]:s.splice(r,1),this.innerSize--,!0;return!1}forEach(e){Mt(this.inner,(n,s)=>{for(const[r,i]of s)e(r,i)})}isEmpty(){return zl(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy=new q(T.comparator);function Ye(){return xy}const nh=new q(T.comparator);function In(...t){let e=nh;for(const n of t)e=e.insert(n.key,n);return e}function sh(t){let e=nh;return t.forEach((n,s)=>e=e.insert(n,s.overlayedDocument)),e}function _t(){return kn()}function rh(){return kn()}function kn(){return new ln(t=>t.toString(),(t,e)=>t.isEqual(e))}const Uy=new q(T.comparator),Fy=new ce(T.comparator);function k(...t){let e=Fy;for(const n of t)e=e.add(n);return e}const Vy=new ce(L);function By(){return Vy}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ih(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Js(e)?"-0":e}}function oh(t){return{integerValue:""+t}}function $y(t,e){return _y(e)?oh(e):ih(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pr{constructor(){this._=void 0}}function qy(t,e,n){return t instanceof Kn?function(s,r){const i={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return r&&Oo(r)&&(r=Po(r)),r&&(i.fields.__previous_value__=r),{mapValue:i}}(n,e):t instanceof nn?ch(t,e):t instanceof Gn?uh(t,e):function(s,r){const i=ah(s,r),o=mc(i)+mc(s.gt);return Ui(i)&&Ui(s.gt)?oh(o):ih(s.serializer,o)}(t,e)}function jy(t,e,n){return t instanceof nn?ch(t,e):t instanceof Gn?uh(t,e):n}function ah(t,e){return t instanceof er?Ui(n=e)||function(s){return!!s&&"doubleValue"in s}(n)?e:{integerValue:0}:null;var n}class Kn extends Pr{}class nn extends Pr{constructor(e){super(),this.elements=e}}function ch(t,e){const n=lh(e);for(const s of t.elements)n.some(r=>xe(r,s))||n.push(s);return{arrayValue:{values:n}}}class Gn extends Pr{constructor(e){super(),this.elements=e}}function uh(t,e){let n=lh(e);for(const s of t.elements)n=n.filter(r=>!xe(r,s));return{arrayValue:{values:n}}}class er extends Pr{constructor(e,n){super(),this.serializer=e,this.gt=n}}function mc(t){return K(t.integerValue||t.doubleValue)}function lh(t){return Mo(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(e,n){this.field=e,this.transform=n}}function zy(t,e){return t.field.isEqual(e.field)&&function(n,s){return n instanceof nn&&s instanceof nn||n instanceof Gn&&s instanceof Gn?Jt(n.elements,s.elements,xe):n instanceof er&&s instanceof er?xe(n.gt,s.gt):n instanceof Kn&&s instanceof Kn}(t.transform,e.transform)}class Hy{constructor(e,n){this.version=e,this.transformResults=n}}class pe{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new pe}static exists(e){return new pe(void 0,e)}static updateTime(e){return new pe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ls(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Mr{}function dh(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Lr(t.key,pe.none()):new ls(t.key,t.data,pe.none());{const n=t.data,s=ve.empty();let r=new ce(ee.comparator);for(let i of e.fields)if(!r.has(i)){let o=n.field(i);o===null&&i.length>1&&(i=i.popLast(),o=n.field(i)),o===null?s.delete(i):s.set(i,o),r=r.add(i)}return new pt(t.key,s,new _e(r.toArray()),pe.none())}}function Ky(t,e,n){t instanceof ls?function(s,r,i){const o=s.value.clone(),a=vc(s.fieldTransforms,r,i.transformResults);o.setAll(a),r.convertToFoundDocument(i.version,o).setHasCommittedMutations()}(t,e,n):t instanceof pt?function(s,r,i){if(!Ls(s.precondition,r))return void r.convertToUnknownDocument(i.version);const o=vc(s.fieldTransforms,r,i.transformResults),a=r.data;a.setAll(fh(s)),a.setAll(o),r.convertToFoundDocument(i.version,a).setHasCommittedMutations()}(t,e,n):function(s,r,i){r.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function Rn(t,e,n,s){return t instanceof ls?function(r,i,o,a){if(!Ls(r.precondition,i))return o;const c=r.value.clone(),u=_c(r.fieldTransforms,a,i);return c.setAll(u),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,s):t instanceof pt?function(r,i,o,a){if(!Ls(r.precondition,i))return o;const c=_c(r.fieldTransforms,a,i),u=i.data;return u.setAll(fh(r)),u.setAll(c),i.convertToFoundDocument(i.version,u).setHasLocalMutations(),o===null?null:o.unionWith(r.fieldMask.fields).unionWith(r.fieldTransforms.map(l=>l.field))}(t,e,n,s):function(r,i,o){return Ls(r.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):o}(t,e,n)}function Gy(t,e){let n=null;for(const s of t.fieldTransforms){const r=e.data.field(s.field),i=ah(s.transform,r||null);i!=null&&(n===null&&(n=ve.empty()),n.set(s.field,i))}return n||null}function yc(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Jt(n,s,(r,i)=>zy(r,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ls extends Mr{constructor(e,n,s,r=[]){super(),this.key=e,this.value=n,this.precondition=s,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class pt extends Mr{constructor(e,n,s,r,i=[]){super(),this.key=e,this.data=n,this.fieldMask=s,this.precondition=r,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function fh(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const s=t.data.field(n);e.set(n,s)}}),e}function vc(t,e,n){const s=new Map;B(t.length===n.length);for(let r=0;r<n.length;r++){const i=t[r],o=i.transform,a=e.data.field(i.field);s.set(i.field,jy(o,a,n[r]))}return s}function _c(t,e,n){const s=new Map;for(const r of t){const i=r.transform,o=n.data.field(r.field);s.set(r.field,qy(i,o,e))}return s}class Lr extends Mr{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Wy extends Mr{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qy{constructor(e,n,s,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=s,this.mutations=r}applyToRemoteDocument(e,n){const s=n.mutationResults;for(let r=0;r<this.mutations.length;r++){const i=this.mutations[r];i.key.isEqual(e.key)&&Ky(i,e,s[r])}}applyToLocalView(e,n){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(n=Rn(s,e,n,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(n=Rn(s,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const s=rh();return this.mutations.forEach(r=>{const i=e.get(r.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=n.has(r.key)?null:a;const c=dh(o,a);c!==null&&s.set(r.key,c),o.isValidDocument()||o.convertToNoDocument(b.min())}),s}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),k())}isEqual(e){return this.batchId===e.batchId&&Jt(this.mutations,e.mutations,(n,s)=>yc(n,s))&&Jt(this.baseMutations,e.baseMutations,(n,s)=>yc(n,s))}}class Fo{constructor(e,n,s,r){this.batch=e,this.commitVersion=n,this.mutationResults=s,this.docVersions=r}static from(e,n,s){B(e.mutations.length===s.length);let r=Uy;const i=e.mutations;for(let o=0;o<i.length;o++)r=r.insert(i[o].key,s[o].version);return new Fo(e,n,s,r)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xy{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yy{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var H,N;function Jy(t){switch(t){default:return I();case f.CANCELLED:case f.UNKNOWN:case f.DEADLINE_EXCEEDED:case f.RESOURCE_EXHAUSTED:case f.INTERNAL:case f.UNAVAILABLE:case f.UNAUTHENTICATED:return!1;case f.INVALID_ARGUMENT:case f.NOT_FOUND:case f.ALREADY_EXISTS:case f.PERMISSION_DENIED:case f.FAILED_PRECONDITION:case f.ABORTED:case f.OUT_OF_RANGE:case f.UNIMPLEMENTED:case f.DATA_LOSS:return!0}}function ph(t){if(t===void 0)return Qe("GRPC error has no .code"),f.UNKNOWN;switch(t){case H.OK:return f.OK;case H.CANCELLED:return f.CANCELLED;case H.UNKNOWN:return f.UNKNOWN;case H.DEADLINE_EXCEEDED:return f.DEADLINE_EXCEEDED;case H.RESOURCE_EXHAUSTED:return f.RESOURCE_EXHAUSTED;case H.INTERNAL:return f.INTERNAL;case H.UNAVAILABLE:return f.UNAVAILABLE;case H.UNAUTHENTICATED:return f.UNAUTHENTICATED;case H.INVALID_ARGUMENT:return f.INVALID_ARGUMENT;case H.NOT_FOUND:return f.NOT_FOUND;case H.ALREADY_EXISTS:return f.ALREADY_EXISTS;case H.PERMISSION_DENIED:return f.PERMISSION_DENIED;case H.FAILED_PRECONDITION:return f.FAILED_PRECONDITION;case H.ABORTED:return f.ABORTED;case H.OUT_OF_RANGE:return f.OUT_OF_RANGE;case H.UNIMPLEMENTED:return f.UNIMPLEMENTED;case H.DATA_LOSS:return f.DATA_LOSS;default:return I()}}(N=H||(H={}))[N.OK=0]="OK",N[N.CANCELLED=1]="CANCELLED",N[N.UNKNOWN=2]="UNKNOWN",N[N.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",N[N.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",N[N.NOT_FOUND=5]="NOT_FOUND",N[N.ALREADY_EXISTS=6]="ALREADY_EXISTS",N[N.PERMISSION_DENIED=7]="PERMISSION_DENIED",N[N.UNAUTHENTICATED=16]="UNAUTHENTICATED",N[N.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",N[N.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",N[N.ABORTED=10]="ABORTED",N[N.OUT_OF_RANGE=11]="OUT_OF_RANGE",N[N.UNIMPLEMENTED=12]="UNIMPLEMENTED",N[N.INTERNAL=13]="INTERNAL",N[N.UNAVAILABLE=14]="UNAVAILABLE",N[N.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(){this.onExistenceFilterMismatchCallbacks=new Map}static get instance(){return As}static getOrCreateInstance(){return As===null&&(As=new xr),As}onExistenceFilterMismatch(e){const n=Symbol();return this.onExistenceFilterMismatchCallbacks.set(n,e),()=>this.onExistenceFilterMismatchCallbacks.delete(n)}notifyOnExistenceFilterMismatch(e){this.onExistenceFilterMismatchCallbacks.forEach(n=>n(e))}}let As=null;/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zy(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ev=new Kt([4294967295,4294967295],0);function wc(t){const e=Zy().encode(t),n=new iy;return n.update(e),new Uint8Array(n.digest())}function Ec(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),s=e.getUint32(4,!0),r=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Kt([n,s],0),new Kt([r,i],0)]}class Vo{constructor(e,n,s){if(this.bitmap=e,this.padding=n,this.hashCount=s,n<0||n>=8)throw new Sn(`Invalid padding: ${n}`);if(s<0)throw new Sn(`Invalid hash count: ${s}`);if(e.length>0&&this.hashCount===0)throw new Sn(`Invalid hash count: ${s}`);if(e.length===0&&n!==0)throw new Sn(`Invalid padding when bitmap length is 0: ${n}`);this.It=8*e.length-n,this.Tt=Kt.fromNumber(this.It)}Et(e,n,s){let r=e.add(n.multiply(Kt.fromNumber(s)));return r.compare(ev)===1&&(r=new Kt([r.getBits(0),r.getBits(1)],0)),r.modulo(this.Tt).toNumber()}At(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}vt(e){if(this.It===0)return!1;const n=wc(e),[s,r]=Ec(n);for(let i=0;i<this.hashCount;i++){const o=this.Et(s,r,i);if(!this.At(o))return!1}return!0}static create(e,n,s){const r=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Vo(i,r,n);return s.forEach(a=>o.insert(a)),o}insert(e){if(this.It===0)return;const n=wc(e),[s,r]=Ec(n);for(let i=0;i<this.hashCount;i++){const o=this.Et(s,r,i);this.Rt(o)}}Rt(e){const n=Math.floor(e/8),s=e%8;this.bitmap[n]|=1<<s}}class Sn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(e,n,s,r,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=s,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,s){const r=new Map;return r.set(e,hs.createSynthesizedTargetChangeForCurrentChange(e,n,s)),new Ur(b.min(),r,new q(L),Ye(),k())}}class hs{constructor(e,n,s,r,i){this.resumeToken=e,this.current=n,this.addedDocuments=s,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,s){return new hs(s,n,k(),k(),k())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xs{constructor(e,n,s,r){this.Pt=e,this.removedTargetIds=n,this.key=s,this.bt=r}}class gh{constructor(e,n){this.targetId=e,this.Vt=n}}class mh{constructor(e,n,s=he.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=s,this.cause=r}}class Tc{constructor(){this.St=0,this.Dt=Sc(),this.Ct=he.EMPTY_BYTE_STRING,this.xt=!1,this.Nt=!0}get current(){return this.xt}get resumeToken(){return this.Ct}get kt(){return this.St!==0}get Mt(){return this.Nt}$t(e){e.approximateByteSize()>0&&(this.Nt=!0,this.Ct=e)}Ot(){let e=k(),n=k(),s=k();return this.Dt.forEach((r,i)=>{switch(i){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:s=s.add(r);break;default:I()}}),new hs(this.Ct,this.xt,e,n,s)}Ft(){this.Nt=!1,this.Dt=Sc()}Bt(e,n){this.Nt=!0,this.Dt=this.Dt.insert(e,n)}Lt(e){this.Nt=!0,this.Dt=this.Dt.remove(e)}qt(){this.St+=1}Ut(){this.St-=1}Kt(){this.Nt=!0,this.xt=!0}}class tv{constructor(e){this.Gt=e,this.Qt=new Map,this.jt=Ye(),this.zt=Ic(),this.Wt=new q(L)}Ht(e){for(const n of e.Pt)e.bt&&e.bt.isFoundDocument()?this.Jt(n,e.bt):this.Yt(n,e.key,e.bt);for(const n of e.removedTargetIds)this.Yt(n,e.key,e.bt)}Xt(e){this.forEachTarget(e,n=>{const s=this.Zt(n);switch(e.state){case 0:this.te(n)&&s.$t(e.resumeToken);break;case 1:s.Ut(),s.kt||s.Ft(),s.$t(e.resumeToken);break;case 2:s.Ut(),s.kt||this.removeTarget(n);break;case 3:this.te(n)&&(s.Kt(),s.$t(e.resumeToken));break;case 4:this.te(n)&&(this.ee(n),s.$t(e.resumeToken));break;default:I()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Qt.forEach((s,r)=>{this.te(r)&&n(r)})}ne(e){var n;const s=e.targetId,r=e.Vt.count,i=this.se(s);if(i){const o=i.target;if(Vi(o))if(r===0){const a=new T(o.path);this.Yt(s,a,ie.newNoDocument(a,b.min()))}else B(r===1);else{const a=this.ie(s);if(a!==r){const c=this.re(e,a);if(c!==0){this.ee(s);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Wt=this.Wt.insert(s,u)}(n=xr.instance)===null||n===void 0||n.notifyOnExistenceFilterMismatch(function(u,l,h){var d,p,y,w,_,O;const P={localCacheCount:l,existenceFilterCount:h.count},R=h.unchangedNames;return R&&(P.bloomFilter={applied:u===0,hashCount:(d=R==null?void 0:R.hashCount)!==null&&d!==void 0?d:0,bitmapLength:(w=(y=(p=R==null?void 0:R.bits)===null||p===void 0?void 0:p.bitmap)===null||y===void 0?void 0:y.length)!==null&&w!==void 0?w:0,padding:(O=(_=R==null?void 0:R.bits)===null||_===void 0?void 0:_.padding)!==null&&O!==void 0?O:0}),P}(c,a,e.Vt))}}}}re(e,n){const{unchangedNames:s,count:r}=e.Vt;if(!s||!s.bits)return 1;const{bits:{bitmap:i="",padding:o=0},hashCount:a=0}=s;let c,u;try{c=kt(i).toUint8Array()}catch(l){if(l instanceof Hl)return Ct("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),1;throw l}try{u=new Vo(c,o,a)}catch(l){return Ct(l instanceof Sn?"BloomFilter error: ":"Applying bloom filter failed: ",l),1}return u.It===0?1:r!==n-this.oe(e.targetId,u)?2:0}oe(e,n){const s=this.Gt.getRemoteKeysForTarget(e);let r=0;return s.forEach(i=>{const o=this.Gt.ue(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;n.vt(a)||(this.Yt(e,i,null),r++)}),r}ce(e){const n=new Map;this.Qt.forEach((i,o)=>{const a=this.se(o);if(a){if(i.current&&Vi(a.target)){const c=new T(a.target.path);this.jt.get(c)!==null||this.ae(o,c)||this.Yt(o,c,ie.newNoDocument(c,e))}i.Mt&&(n.set(o,i.Ot()),i.Ft())}});let s=k();this.zt.forEach((i,o)=>{let a=!0;o.forEachWhile(c=>{const u=this.se(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(s=s.add(i))}),this.jt.forEach((i,o)=>o.setReadTime(e));const r=new Ur(e,n,this.Wt,this.jt,s);return this.jt=Ye(),this.zt=Ic(),this.Wt=new q(L),r}Jt(e,n){if(!this.te(e))return;const s=this.ae(e,n.key)?2:0;this.Zt(e).Bt(n.key,s),this.jt=this.jt.insert(n.key,n),this.zt=this.zt.insert(n.key,this.he(n.key).add(e))}Yt(e,n,s){if(!this.te(e))return;const r=this.Zt(e);this.ae(e,n)?r.Bt(n,1):r.Lt(n),this.zt=this.zt.insert(n,this.he(n).delete(e)),s&&(this.jt=this.jt.insert(n,s))}removeTarget(e){this.Qt.delete(e)}ie(e){const n=this.Zt(e).Ot();return this.Gt.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}qt(e){this.Zt(e).qt()}Zt(e){let n=this.Qt.get(e);return n||(n=new Tc,this.Qt.set(e,n)),n}he(e){let n=this.zt.get(e);return n||(n=new ce(L),this.zt=this.zt.insert(e,n)),n}te(e){const n=this.se(e)!==null;return n||E("WatchChangeAggregator","Detected inactive target",e),n}se(e){const n=this.Qt.get(e);return n&&n.kt?null:this.Gt.le(e)}ee(e){this.Qt.set(e,new Tc),this.Gt.getRemoteKeysForTarget(e).forEach(n=>{this.Yt(e,n,null)})}ae(e,n){return this.Gt.getRemoteKeysForTarget(e).has(n)}}function Ic(){return new q(T.comparator)}function Sc(){return new q(T.comparator)}const nv={asc:"ASCENDING",desc:"DESCENDING"},sv={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},rv={and:"AND",or:"OR"};class iv{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function ji(t,e){return t.useProto3Json||kr(e)?e:{value:e}}function tr(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function yh(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function ov(t,e){return tr(t,e.toTimestamp())}function Me(t){return B(!!t),b.fromTimestamp(function(e){const n=lt(e);return new W(n.seconds,n.nanos)}(t))}function Bo(t,e){return function(n){return new V(["projects",n.projectId,"databases",n.database])}(t).child("documents").child(e).canonicalString()}function vh(t){const e=V.fromString(t);return B(Th(e)),e}function zi(t,e){return Bo(t.databaseId,e.path)}function ui(t,e){const n=vh(e);if(n.get(1)!==t.databaseId.projectId)throw new v(f.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new v(f.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new T(_h(n))}function Hi(t,e){return Bo(t.databaseId,e)}function av(t){const e=vh(t);return e.length===4?V.emptyPath():_h(e)}function Ki(t){return new V(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function _h(t){return B(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function bc(t,e,n){return{name:zi(t,e),fields:n.value.mapValue.fields}}function cv(t,e){let n;if("targetChange"in e){e.targetChange;const s=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:I()}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],i=function(c,u){return c.useProto3Json?(B(u===void 0||typeof u=="string"),he.fromBase64String(u||"")):(B(u===void 0||u instanceof Uint8Array),he.fromUint8Array(u||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(c){const u=c.code===void 0?f.UNKNOWN:ph(c.code);return new v(u,c.message||"")}(o);n=new mh(s,r,i,a||null)}else if("documentChange"in e){e.documentChange;const s=e.documentChange;s.document,s.document.name,s.document.updateTime;const r=ui(t,s.document.name),i=Me(s.document.updateTime),o=s.document.createTime?Me(s.document.createTime):b.min(),a=new ve({mapValue:{fields:s.document.fields}}),c=ie.newFoundDocument(r,i,o,a),u=s.targetIds||[],l=s.removedTargetIds||[];n=new xs(u,l,c.key,c)}else if("documentDelete"in e){e.documentDelete;const s=e.documentDelete;s.document;const r=ui(t,s.document),i=s.readTime?Me(s.readTime):b.min(),o=ie.newNoDocument(r,i),a=s.removedTargetIds||[];n=new xs([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const s=e.documentRemove;s.document;const r=ui(t,s.document),i=s.removedTargetIds||[];n=new xs([],i,r,null)}else{if(!("filter"in e))return I();{e.filter;const s=e.filter;s.targetId;const{count:r=0,unchangedNames:i}=s,o=new Yy(r,i),a=s.targetId;n=new gh(a,o)}}return n}function uv(t,e){let n;if(e instanceof ls)n={update:bc(t,e.key,e.value)};else if(e instanceof Lr)n={delete:zi(t,e.key)};else if(e instanceof pt)n={update:bc(t,e.key,e.data),updateMask:vv(e.fieldMask)};else{if(!(e instanceof Wy))return I();n={verify:zi(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(s=>function(r,i){const o=i.transform;if(o instanceof Kn)return{fieldPath:i.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(o instanceof nn)return{fieldPath:i.field.canonicalString(),appendMissingElements:{values:o.elements}};if(o instanceof Gn)return{fieldPath:i.field.canonicalString(),removeAllFromArray:{values:o.elements}};if(o instanceof er)return{fieldPath:i.field.canonicalString(),increment:o.gt};throw I()}(0,s))),e.precondition.isNone||(n.currentDocument=function(s,r){return r.updateTime!==void 0?{updateTime:ov(s,r.updateTime)}:r.exists!==void 0?{exists:r.exists}:I()}(t,e.precondition)),n}function lv(t,e){return t&&t.length>0?(B(e!==void 0),t.map(n=>function(s,r){let i=s.updateTime?Me(s.updateTime):Me(r);return i.isEqual(b.min())&&(i=Me(r)),new Hy(i,s.transformResults||[])}(n,e))):[]}function hv(t,e){return{documents:[Hi(t,e.path)]}}function dv(t,e){const n={structuredQuery:{}},s=e.path;e.collectionGroup!==null?(n.parent=Hi(t,s),n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(n.parent=Hi(t,s.popLast()),n.structuredQuery.from=[{collectionId:s.lastSegment()}]);const r=function(c){if(c.length!==0)return Eh(Se.create(c,"and"))}(e.filters);r&&(n.structuredQuery.where=r);const i=function(c){if(c.length!==0)return c.map(u=>function(l){return{field:Vt(l.field),direction:gv(l.dir)}}(u))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);const o=ji(t,e.limit);var a;return o!==null&&(n.structuredQuery.limit=o),e.startAt&&(n.structuredQuery.startAt={before:(a=e.startAt).inclusive,values:a.position}),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),n}function fv(t){let e=av(t.parent);const n=t.structuredQuery,s=n.from?n.from.length:0;let r=null;if(s>0){B(s===1);const l=n.from[0];l.allDescendants?r=l.collectionId:e=e.child(l.collectionId)}let i=[];n.where&&(i=function(l){const h=wh(l);return h instanceof Se&&Ql(h)?h.getFilters():[h]}(n.where));let o=[];n.orderBy&&(o=n.orderBy.map(l=>function(h){return new Gt(Bt(h.field),function(d){switch(d){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(h.direction))}(l)));let a=null;n.limit&&(a=function(l){let h;return h=typeof l=="object"?l.value:l,kr(h)?null:h}(n.limit));let c=null;n.startAt&&(c=function(l){const h=!!l.before,d=l.values||[];return new Zs(d,h)}(n.startAt));let u=null;return n.endAt&&(u=function(l){const h=!l.before,d=l.values||[];return new Zs(d,h)}(n.endAt)),Py(e,r,o,i,a,"F",c,u)}function pv(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return I()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function wh(t){return t.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=Bt(e.unaryFilter.field);return G.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Bt(e.unaryFilter.field);return G.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=Bt(e.unaryFilter.field);return G.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const i=Bt(e.unaryFilter.field);return G.create(i,"!=",{nullValue:"NULL_VALUE"});default:return I()}}(t):t.fieldFilter!==void 0?function(e){return G.create(Bt(e.fieldFilter.field),function(n){switch(n){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return I()}}(e.fieldFilter.op),e.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(e){return Se.create(e.compositeFilter.filters.map(n=>wh(n)),function(n){switch(n){case"AND":return"and";case"OR":return"or";default:return I()}}(e.compositeFilter.op))}(t):I()}function gv(t){return nv[t]}function mv(t){return sv[t]}function yv(t){return rv[t]}function Vt(t){return{fieldPath:t.canonicalString()}}function Bt(t){return ee.fromServerFormat(t.fieldPath)}function Eh(t){return t instanceof G?function(e){if(e.op==="=="){if(hc(e.value))return{unaryFilter:{field:Vt(e.field),op:"IS_NAN"}};if(lc(e.value))return{unaryFilter:{field:Vt(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(hc(e.value))return{unaryFilter:{field:Vt(e.field),op:"IS_NOT_NAN"}};if(lc(e.value))return{unaryFilter:{field:Vt(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Vt(e.field),op:mv(e.op),value:e.value}}}(t):t instanceof Se?function(e){const n=e.getFilters().map(s=>Eh(s));return n.length===1?n[0]:{compositeFilter:{op:yv(e.op),filters:n}}}(t):I()}function vv(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Th(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e,n,s,r,i=b.min(),o=b.min(),a=he.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=s,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new it(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new it(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _v{constructor(e){this.fe=e}}function wv(t){const e=fv({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?$i(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ev{constructor(){this.rn=new Tv}addToCollectionParentIndex(e,n){return this.rn.add(n),g.resolve()}getCollectionParents(e,n){return g.resolve(this.rn.getEntries(n))}addFieldIndex(e,n){return g.resolve()}deleteFieldIndex(e,n){return g.resolve()}getDocumentsMatchingTarget(e,n){return g.resolve(null)}getIndexType(e,n){return g.resolve(0)}getFieldIndexes(e,n){return g.resolve([])}getNextCollectionGroupToUpdate(e){return g.resolve(null)}getMinOffset(e,n){return g.resolve(ut.min())}getMinOffsetFromCollectionGroup(e,n){return g.resolve(ut.min())}updateCollectionGroup(e,n,s){return g.resolve()}updateIndexEntries(e,n){return g.resolve()}}class Tv{constructor(){this.index={}}add(e){const n=e.lastSegment(),s=e.popLast(),r=this.index[n]||new ce(V.comparator),i=!r.has(s);return this.index[n]=r.add(s),i}has(e){const n=e.lastSegment(),s=e.popLast(),r=this.index[n];return r&&r.has(s)}getEntries(e){return(this.index[e]||new ce(V.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn{constructor(e){this.Nn=e}next(){return this.Nn+=2,this.Nn}static kn(){return new sn(0)}static Mn(){return new sn(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iv{constructor(){this.changes=new ln(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,ie.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const s=this.changes.get(n);return s!==void 0?g.resolve(s):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sv{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bv{constructor(e,n,s,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=s,this.indexManager=r}getDocument(e,n){let s=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(s=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(s!==null&&Rn(s.mutation,r,_e.empty(),W.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(s=>this.getLocalViewOfDocuments(e,s,k()).next(()=>s))}getLocalViewOfDocuments(e,n,s=k()){const r=_t();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,s).next(i=>{let o=In();return i.forEach((a,c)=>{o=o.insert(a,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const s=_t();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,k()))}populateOverlays(e,n,s){const r=[];return s.forEach(i=>{n.has(i)||r.push(i)}),this.documentOverlayCache.getOverlays(e,r).next(i=>{i.forEach((o,a)=>{n.set(o,a)})})}computeViews(e,n,s,r){let i=Ye();const o=kn(),a=kn();return n.forEach((c,u)=>{const l=s.get(u.key);r.has(u.key)&&(l===void 0||l.mutation instanceof pt)?i=i.insert(u.key,u):l!==void 0?(o.set(u.key,l.mutation.getFieldMask()),Rn(l.mutation,u,l.mutation.getFieldMask(),W.now())):o.set(u.key,_e.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((u,l)=>o.set(u,l)),n.forEach((u,l)=>{var h;return a.set(u,new Sv(l,(h=o.get(u))!==null&&h!==void 0?h:null))}),a))}recalculateAndSaveOverlays(e,n){const s=kn();let r=new q((o,a)=>o-a),i=k();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const a of o)a.keys().forEach(c=>{const u=n.get(c);if(u===null)return;let l=s.get(c)||_e.empty();l=a.applyToLocalView(u,l),s.set(c,l);const h=(r.get(a.batchId)||k()).add(c);r=r.insert(a.batchId,h)})}).next(()=>{const o=[],a=r.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),u=c.key,l=c.value,h=rh();l.forEach(d=>{if(!i.has(d)){const p=dh(n.get(d),s.get(d));p!==null&&h.set(d,p),i=i.add(d)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,h))}return g.waitFor(o)}).next(()=>s)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(s=>this.recalculateAndSaveOverlays(e,s))}getDocumentsMatchingQuery(e,n,s){return function(r){return T.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):Zl(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,s):this.getDocumentsMatchingCollectionQuery(e,n,s)}getNextDocuments(e,n,s,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,s,r).next(i=>{const o=r-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,s.largestBatchId,r-i.size):g.resolve(_t());let a=-1,c=i;return o.next(u=>g.forEach(u,(l,h)=>(a<h.largestBatchId&&(a=h.largestBatchId),i.get(l)?g.resolve():this.remoteDocumentCache.getEntry(e,l).next(d=>{c=c.insert(l,d)}))).next(()=>this.populateOverlays(e,u,i)).next(()=>this.computeViews(e,c,u,k())).next(l=>({batchId:a,changes:sh(l)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new T(n)).next(s=>{let r=In();return s.isFoundDocument()&&(r=r.insert(s.key,s)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,s){const r=n.collectionGroup;let i=In();return this.indexManager.getCollectionParents(e,r).next(o=>g.forEach(o,a=>{const c=function(u,l){return new un(l,null,u.explicitOrderBy.slice(),u.filters.slice(),u.limit,u.limitType,u.startAt,u.endAt)}(n,a.child(r));return this.getDocumentsMatchingCollectionQuery(e,c,s).next(u=>{u.forEach((l,h)=>{i=i.insert(l,h)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,s){let r;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,s.largestBatchId).next(i=>(r=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,s,r))).next(i=>{r.forEach((a,c)=>{const u=c.getKey();i.get(u)===null&&(i=i.insert(u,ie.newInvalidDocument(u)))});let o=In();return i.forEach((a,c)=>{const u=r.get(a);u!==void 0&&Rn(u.mutation,c,_e.empty(),W.now()),Or(n,c)&&(o=o.insert(a,c))}),o})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Av{constructor(e){this.serializer=e,this.cs=new Map,this.hs=new Map}getBundleMetadata(e,n){return g.resolve(this.cs.get(n))}saveBundleMetadata(e,n){var s;return this.cs.set(n.id,{id:(s=n).id,version:s.version,createTime:Me(s.createTime)}),g.resolve()}getNamedQuery(e,n){return g.resolve(this.hs.get(n))}saveNamedQuery(e,n){return this.hs.set(n.name,function(s){return{name:s.name,query:wv(s.bundledQuery),readTime:Me(s.readTime)}}(n)),g.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cv{constructor(){this.overlays=new q(T.comparator),this.ls=new Map}getOverlay(e,n){return g.resolve(this.overlays.get(n))}getOverlays(e,n){const s=_t();return g.forEach(n,r=>this.getOverlay(e,r).next(i=>{i!==null&&s.set(r,i)})).next(()=>s)}saveOverlays(e,n,s){return s.forEach((r,i)=>{this.we(e,n,i)}),g.resolve()}removeOverlaysForBatchId(e,n,s){const r=this.ls.get(s);return r!==void 0&&(r.forEach(i=>this.overlays=this.overlays.remove(i)),this.ls.delete(s)),g.resolve()}getOverlaysForCollection(e,n,s){const r=_t(),i=n.length+1,o=new T(n.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,u=c.getKey();if(!n.isPrefixOf(u.path))break;u.path.length===i&&c.largestBatchId>s&&r.set(c.getKey(),c)}return g.resolve(r)}getOverlaysForCollectionGroup(e,n,s,r){let i=new q((u,l)=>u-l);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===n&&u.largestBatchId>s){let l=i.get(u.largestBatchId);l===null&&(l=_t(),i=i.insert(u.largestBatchId,l)),l.set(u.getKey(),u)}}const a=_t(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,l)=>a.set(u,l)),!(a.size()>=r)););return g.resolve(a)}we(e,n,s){const r=this.overlays.get(s.key);if(r!==null){const o=this.ls.get(r.largestBatchId).delete(s.key);this.ls.set(r.largestBatchId,o)}this.overlays=this.overlays.insert(s.key,new Xy(n,s));let i=this.ls.get(n);i===void 0&&(i=k(),this.ls.set(n,i)),this.ls.set(n,i.add(s.key))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(){this.fs=new ce(Q.ds),this.ws=new ce(Q._s)}isEmpty(){return this.fs.isEmpty()}addReference(e,n){const s=new Q(e,n);this.fs=this.fs.add(s),this.ws=this.ws.add(s)}gs(e,n){e.forEach(s=>this.addReference(s,n))}removeReference(e,n){this.ys(new Q(e,n))}ps(e,n){e.forEach(s=>this.removeReference(s,n))}Is(e){const n=new T(new V([])),s=new Q(n,e),r=new Q(n,e+1),i=[];return this.ws.forEachInRange([s,r],o=>{this.ys(o),i.push(o.key)}),i}Ts(){this.fs.forEach(e=>this.ys(e))}ys(e){this.fs=this.fs.delete(e),this.ws=this.ws.delete(e)}Es(e){const n=new T(new V([])),s=new Q(n,e),r=new Q(n,e+1);let i=k();return this.ws.forEachInRange([s,r],o=>{i=i.add(o.key)}),i}containsKey(e){const n=new Q(e,0),s=this.fs.firstAfterOrEqual(n);return s!==null&&e.isEqual(s.key)}}class Q{constructor(e,n){this.key=e,this.As=n}static ds(e,n){return T.comparator(e.key,n.key)||L(e.As,n.As)}static _s(e,n){return L(e.As,n.As)||T.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kv{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.vs=1,this.Rs=new ce(Q.ds)}checkEmpty(e){return g.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,s,r){const i=this.vs;this.vs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Qy(i,n,s,r);this.mutationQueue.push(o);for(const a of r)this.Rs=this.Rs.add(new Q(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return g.resolve(o)}lookupMutationBatch(e,n){return g.resolve(this.Ps(n))}getNextMutationBatchAfterBatchId(e,n){const s=n+1,r=this.bs(s),i=r<0?0:r;return g.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return g.resolve(this.mutationQueue.length===0?-1:this.vs-1)}getAllMutationBatches(e){return g.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const s=new Q(n,0),r=new Q(n,Number.POSITIVE_INFINITY),i=[];return this.Rs.forEachInRange([s,r],o=>{const a=this.Ps(o.As);i.push(a)}),g.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let s=new ce(L);return n.forEach(r=>{const i=new Q(r,0),o=new Q(r,Number.POSITIVE_INFINITY);this.Rs.forEachInRange([i,o],a=>{s=s.add(a.As)})}),g.resolve(this.Vs(s))}getAllMutationBatchesAffectingQuery(e,n){const s=n.path,r=s.length+1;let i=s;T.isDocumentKey(i)||(i=i.child(""));const o=new Q(new T(i),0);let a=new ce(L);return this.Rs.forEachWhile(c=>{const u=c.key.path;return!!s.isPrefixOf(u)&&(u.length===r&&(a=a.add(c.As)),!0)},o),g.resolve(this.Vs(a))}Vs(e){const n=[];return e.forEach(s=>{const r=this.Ps(s);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){B(this.Ss(n.batchId,"removed")===0),this.mutationQueue.shift();let s=this.Rs;return g.forEach(n.mutations,r=>{const i=new Q(r.key,n.batchId);return s=s.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Rs=s})}Cn(e){}containsKey(e,n){const s=new Q(n,0),r=this.Rs.firstAfterOrEqual(s);return g.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,g.resolve()}Ss(e,n){return this.bs(e)}bs(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Ps(e){const n=this.bs(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rv{constructor(e){this.Ds=e,this.docs=new q(T.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const s=n.key,r=this.docs.get(s),i=r?r.size:0,o=this.Ds(n);return this.docs=this.docs.insert(s,{document:n.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const s=this.docs.get(n);return g.resolve(s?s.document.mutableCopy():ie.newInvalidDocument(n))}getEntries(e,n){let s=Ye();return n.forEach(r=>{const i=this.docs.get(r);s=s.insert(r,i?i.document.mutableCopy():ie.newInvalidDocument(r))}),g.resolve(s)}getDocumentsMatchingQuery(e,n,s,r){let i=Ye();const o=n.path,a=new T(o.child("")),c=this.docs.getIteratorFrom(a);for(;c.hasNext();){const{key:u,value:{document:l}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||my(gy(l),s)<=0||(r.has(l.key)||Or(n,l))&&(i=i.insert(l.key,l.mutableCopy()))}return g.resolve(i)}getAllFromCollectionGroup(e,n,s,r){I()}Cs(e,n){return g.forEach(this.docs,s=>n(s))}newChangeBuffer(e){return new Nv(this)}getSize(e){return g.resolve(this.size)}}class Nv extends Iv{constructor(e){super(),this.os=e}applyChanges(e){const n=[];return this.changes.forEach((s,r)=>{r.isValidDocument()?n.push(this.os.addEntry(e,r)):this.os.removeEntry(s)}),g.waitFor(n)}getFromCache(e,n){return this.os.getEntry(e,n)}getAllFromCache(e,n){return this.os.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dv{constructor(e){this.persistence=e,this.xs=new ln(n=>Lo(n),xo),this.lastRemoteSnapshotVersion=b.min(),this.highestTargetId=0,this.Ns=0,this.ks=new $o,this.targetCount=0,this.Ms=sn.kn()}forEachTarget(e,n){return this.xs.forEach((s,r)=>n(r)),g.resolve()}getLastRemoteSnapshotVersion(e){return g.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return g.resolve(this.Ns)}allocateTargetId(e){return this.highestTargetId=this.Ms.next(),g.resolve(this.highestTargetId)}setTargetsMetadata(e,n,s){return s&&(this.lastRemoteSnapshotVersion=s),n>this.Ns&&(this.Ns=n),g.resolve()}Fn(e){this.xs.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.Ms=new sn(n),this.highestTargetId=n),e.sequenceNumber>this.Ns&&(this.Ns=e.sequenceNumber)}addTargetData(e,n){return this.Fn(n),this.targetCount+=1,g.resolve()}updateTargetData(e,n){return this.Fn(n),g.resolve()}removeTargetData(e,n){return this.xs.delete(n.target),this.ks.Is(n.targetId),this.targetCount-=1,g.resolve()}removeTargets(e,n,s){let r=0;const i=[];return this.xs.forEach((o,a)=>{a.sequenceNumber<=n&&s.get(a.targetId)===null&&(this.xs.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),r++)}),g.waitFor(i).next(()=>r)}getTargetCount(e){return g.resolve(this.targetCount)}getTargetData(e,n){const s=this.xs.get(n)||null;return g.resolve(s)}addMatchingKeys(e,n,s){return this.ks.gs(n,s),g.resolve()}removeMatchingKeys(e,n,s){this.ks.ps(n,s);const r=this.persistence.referenceDelegate,i=[];return r&&n.forEach(o=>{i.push(r.markPotentiallyOrphaned(e,o))}),g.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.ks.Is(n),g.resolve()}getMatchingKeysForTargetId(e,n){const s=this.ks.Es(n);return g.resolve(s)}containsKey(e,n){return g.resolve(this.ks.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ov{constructor(e,n){this.$s={},this.overlays={},this.Os=new Do(0),this.Fs=!1,this.Fs=!0,this.referenceDelegate=e(this),this.Bs=new Dv(this),this.indexManager=new Ev,this.remoteDocumentCache=function(s){return new Rv(s)}(s=>this.referenceDelegate.Ls(s)),this.serializer=new _v(n),this.qs=new Av(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Fs=!1,Promise.resolve()}get started(){return this.Fs}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new Cv,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let s=this.$s[e.toKey()];return s||(s=new kv(n,this.referenceDelegate),this.$s[e.toKey()]=s),s}getTargetCache(){return this.Bs}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.qs}runTransaction(e,n,s){E("MemoryPersistence","Starting transaction:",e);const r=new Pv(this.Os.next());return this.referenceDelegate.Us(),s(r).next(i=>this.referenceDelegate.Ks(r).next(()=>i)).toPromise().then(i=>(r.raiseOnCommittedEvent(),i))}Gs(e,n){return g.or(Object.values(this.$s).map(s=>()=>s.containsKey(e,n)))}}class Pv extends vy{constructor(e){super(),this.currentSequenceNumber=e}}class qo{constructor(e){this.persistence=e,this.Qs=new $o,this.js=null}static zs(e){return new qo(e)}get Ws(){if(this.js)return this.js;throw I()}addReference(e,n,s){return this.Qs.addReference(s,n),this.Ws.delete(s.toString()),g.resolve()}removeReference(e,n,s){return this.Qs.removeReference(s,n),this.Ws.add(s.toString()),g.resolve()}markPotentiallyOrphaned(e,n){return this.Ws.add(n.toString()),g.resolve()}removeTarget(e,n){this.Qs.Is(n.targetId).forEach(r=>this.Ws.add(r.toString()));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(i=>this.Ws.add(i.toString()))}).next(()=>s.removeTargetData(e,n))}Us(){this.js=new Set}Ks(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return g.forEach(this.Ws,s=>{const r=T.fromPath(s);return this.Hs(e,r).next(i=>{i||n.removeEntry(r,b.min())})}).next(()=>(this.js=null,n.apply(e)))}updateLimboDocument(e,n){return this.Hs(e,n).next(s=>{s?this.Ws.delete(n.toString()):this.Ws.add(n.toString())})}Ls(e){return 0}Hs(e,n){return g.or([()=>g.resolve(this.Qs.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Gs(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jo{constructor(e,n,s,r){this.targetId=e,this.fromCache=n,this.Fi=s,this.Bi=r}static Li(e,n){let s=k(),r=k();for(const i of n.docChanges)switch(i.type){case 0:s=s.add(i.doc.key);break;case 1:r=r.add(i.doc.key)}return new jo(e,n.fromCache,s,r)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mv{constructor(){this.qi=!1}initialize(e,n){this.Ui=e,this.indexManager=n,this.qi=!0}getDocumentsMatchingQuery(e,n,s,r){return this.Ki(e,n).next(i=>i||this.Gi(e,n,r,s)).next(i=>i||this.Qi(e,n))}Ki(e,n){if(gc(n))return g.resolve(null);let s=Xe(n);return this.indexManager.getIndexType(e,s).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=$i(n,null,"F"),s=Xe(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next(i=>{const o=k(...i);return this.Ui.getDocuments(e,o).next(a=>this.indexManager.getMinOffset(e,s).next(c=>{const u=this.ji(n,a);return this.zi(n,u,o,c.readTime)?this.Ki(e,$i(n,null,"F")):this.Wi(e,u,n,c)}))})))}Gi(e,n,s,r){return gc(n)||r.isEqual(b.min())?this.Qi(e,n):this.Ui.getDocuments(e,s).next(i=>{const o=this.ji(n,i);return this.zi(n,o,s,r)?this.Qi(e,n):(ic()<=D.DEBUG&&E("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),qi(n)),this.Wi(e,o,n,py(r,-1)))})}ji(e,n){let s=new ce(th(e));return n.forEach((r,i)=>{Or(e,i)&&(s=s.add(i))}),s}zi(e,n,s,r){if(e.limit===null)return!1;if(s.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}Qi(e,n){return ic()<=D.DEBUG&&E("QueryEngine","Using full collection scan to execute query:",qi(n)),this.Ui.getDocumentsMatchingQuery(e,n,ut.min())}Wi(e,n,s,r){return this.Ui.getDocumentsMatchingQuery(e,s,r).next(i=>(n.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lv{constructor(e,n,s,r){this.persistence=e,this.Hi=n,this.serializer=r,this.Ji=new q(L),this.Yi=new ln(i=>Lo(i),xo),this.Xi=new Map,this.Zi=e.getRemoteDocumentCache(),this.Bs=e.getTargetCache(),this.qs=e.getBundleCache(),this.tr(s)}tr(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new bv(this.Zi,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Zi.setIndexManager(this.indexManager),this.Hi.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.Ji))}}function xv(t,e,n,s){return new Lv(t,e,n,s)}async function Ih(t,e){const n=C(t);return await n.persistence.runTransaction("Handle user change","readonly",s=>{let r;return n.mutationQueue.getAllMutationBatches(s).next(i=>(r=i,n.tr(e),n.mutationQueue.getAllMutationBatches(s))).next(i=>{const o=[],a=[];let c=k();for(const u of r){o.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}for(const u of i){a.push(u.batchId);for(const l of u.mutations)c=c.add(l.key)}return n.localDocuments.getDocuments(s,c).next(u=>({er:u,removedBatchIds:o,addedBatchIds:a}))})})}function Uv(t,e){const n=C(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",s=>{const r=e.batch.keys(),i=n.Zi.newChangeBuffer({trackRemovals:!0});return function(o,a,c,u){const l=c.batch,h=l.keys();let d=g.resolve();return h.forEach(p=>{d=d.next(()=>u.getEntry(a,p)).next(y=>{const w=c.docVersions.get(p);B(w!==null),y.version.compareTo(w)<0&&(l.applyToRemoteDocument(y,c),y.isValidDocument()&&(y.setReadTime(c.commitVersion),u.addEntry(y)))})}),d.next(()=>o.mutationQueue.removeMutationBatch(a,l))}(n,s,e,i).next(()=>i.apply(s)).next(()=>n.mutationQueue.performConsistencyCheck(s)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(s,r,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,function(o){let a=k();for(let c=0;c<o.mutationResults.length;++c)o.mutationResults[c].transformResults.length>0&&(a=a.add(o.batch.mutations[c].key));return a}(e))).next(()=>n.localDocuments.getDocuments(s,r))})}function Sh(t){const e=C(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Bs.getLastRemoteSnapshotVersion(n))}function Fv(t,e){const n=C(t),s=e.snapshotVersion;let r=n.Ji;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=n.Zi.newChangeBuffer({trackRemovals:!0});r=n.Ji;const a=[];e.targetChanges.forEach((l,h)=>{const d=r.get(h);if(!d)return;a.push(n.Bs.removeMatchingKeys(i,l.removedDocuments,h).next(()=>n.Bs.addMatchingKeys(i,l.addedDocuments,h)));let p=d.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(h)!==null?p=p.withResumeToken(he.EMPTY_BYTE_STRING,b.min()).withLastLimboFreeSnapshotVersion(b.min()):l.resumeToken.approximateByteSize()>0&&(p=p.withResumeToken(l.resumeToken,s)),r=r.insert(h,p),function(y,w,_){return y.resumeToken.approximateByteSize()===0||w.snapshotVersion.toMicroseconds()-y.snapshotVersion.toMicroseconds()>=3e8?!0:_.addedDocuments.size+_.modifiedDocuments.size+_.removedDocuments.size>0}(d,p,l)&&a.push(n.Bs.updateTargetData(i,p))});let c=Ye(),u=k();if(e.documentUpdates.forEach(l=>{e.resolvedLimboDocuments.has(l)&&a.push(n.persistence.referenceDelegate.updateLimboDocument(i,l))}),a.push(Vv(i,o,e.documentUpdates).next(l=>{c=l.nr,u=l.sr})),!s.isEqual(b.min())){const l=n.Bs.getLastRemoteSnapshotVersion(i).next(h=>n.Bs.setTargetsMetadata(i,i.currentSequenceNumber,s));a.push(l)}return g.waitFor(a).next(()=>o.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,u)).next(()=>c)}).then(i=>(n.Ji=r,i))}function Vv(t,e,n){let s=k(),r=k();return n.forEach(i=>s=s.add(i)),e.getEntries(t,s).next(i=>{let o=Ye();return n.forEach((a,c)=>{const u=i.get(a);c.isFoundDocument()!==u.isFoundDocument()&&(r=r.add(a)),c.isNoDocument()&&c.version.isEqual(b.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):E("LocalStore","Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",c.version)}),{nr:o,sr:r}})}function Bv(t,e){const n=C(t);return n.persistence.runTransaction("Get next mutation batch","readonly",s=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(s,e)))}function $v(t,e){const n=C(t);return n.persistence.runTransaction("Allocate target","readwrite",s=>{let r;return n.Bs.getTargetData(s,e).next(i=>i?(r=i,g.resolve(r)):n.Bs.allocateTargetId(s).next(o=>(r=new it(e,o,"TargetPurposeListen",s.currentSequenceNumber),n.Bs.addTargetData(s,r).next(()=>r))))}).then(s=>{const r=n.Ji.get(s.targetId);return(r===null||s.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Ji=n.Ji.insert(s.targetId,s),n.Yi.set(e,s.targetId)),s})}async function Gi(t,e,n){const s=C(t),r=s.Ji.get(e),i=n?"readwrite":"readwrite-primary";try{n||await s.persistence.runTransaction("Release target",i,o=>s.persistence.referenceDelegate.removeTarget(o,r))}catch(o){if(!us(o))throw o;E("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}s.Ji=s.Ji.remove(e),s.Yi.delete(r.target)}function Ac(t,e,n){const s=C(t);let r=b.min(),i=k();return s.persistence.runTransaction("Execute query","readonly",o=>function(a,c,u){const l=C(a),h=l.Yi.get(u);return h!==void 0?g.resolve(l.Ji.get(h)):l.Bs.getTargetData(c,u)}(s,o,Xe(e)).next(a=>{if(a)return r=a.lastLimboFreeSnapshotVersion,s.Bs.getMatchingKeysForTargetId(o,a.targetId).next(c=>{i=c})}).next(()=>s.Hi.getDocumentsMatchingQuery(o,e,n?r:b.min(),n?i:k())).next(a=>(qv(s,My(e),a),{documents:a,ir:i})))}function qv(t,e,n){let s=t.Xi.get(e)||b.min();n.forEach((r,i)=>{i.readTime.compareTo(s)>0&&(s=i.readTime)}),t.Xi.set(e,s)}class Cc{constructor(){this.activeTargetIds=By()}lr(e){this.activeTargetIds=this.activeTargetIds.add(e)}dr(e){this.activeTargetIds=this.activeTargetIds.delete(e)}hr(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class jv{constructor(){this.Hr=new Cc,this.Jr={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,s){}addLocalQueryTarget(e){return this.Hr.lr(e),this.Jr[e]||"not-current"}updateQueryState(e,n,s){this.Jr[e]=n}removeLocalQueryTarget(e){this.Hr.dr(e)}isLocalQueryTarget(e){return this.Hr.activeTargetIds.has(e)}clearQueryState(e){delete this.Jr[e]}getAllActiveQueryTargets(){return this.Hr.activeTargetIds}isActiveQueryTarget(e){return this.Hr.activeTargetIds.has(e)}start(){return this.Hr=new Cc,Promise.resolve()}handleUserChange(e,n,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zv{Yr(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(){this.Xr=()=>this.Zr(),this.eo=()=>this.no(),this.so=[],this.io()}Yr(e){this.so.push(e)}shutdown(){window.removeEventListener("online",this.Xr),window.removeEventListener("offline",this.eo)}io(){window.addEventListener("online",this.Xr),window.addEventListener("offline",this.eo)}Zr(){E("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.so)e(0)}no(){E("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.so)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cs=null;function li(){return Cs===null?Cs=268435456+Math.round(2147483648*Math.random()):Cs++,"0x"+Cs.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hv={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kv{constructor(e){this.ro=e.ro,this.oo=e.oo}uo(e){this.co=e}ao(e){this.ho=e}onMessage(e){this.lo=e}close(){this.oo()}send(e){this.ro(e)}fo(){this.co()}wo(e){this.ho(e)}_o(e){this.lo(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const se="WebChannelConnection";class Gv extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http";this.mo=n+"://"+e.host,this.yo="projects/"+this.databaseId.projectId+"/databases/"+this.databaseId.database+"/documents"}get po(){return!1}Io(e,n,s,r,i){const o=li(),a=this.To(e,n);E("RestConnection",`Sending RPC '${e}' ${o}:`,a,s);const c={};return this.Eo(c,r,i),this.Ao(e,a,c,s).then(u=>(E("RestConnection",`Received RPC '${e}' ${o}: `,u),u),u=>{throw Ct("RestConnection",`RPC '${e}' ${o} failed with error: `,u,"url: ",a,"request:",s),u})}vo(e,n,s,r,i,o){return this.Io(e,n,s,r,i)}Eo(e,n,s){e["X-Goog-Api-Client"]="gl-js/ fire/"+cn,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,i)=>e[i]=r),s&&s.headers.forEach((r,i)=>e[i]=r)}To(e,n){const s=Hv[e];return`${this.mo}/v1/${n}:${s}`}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Ao(e,n,s,r){const i=li();return new Promise((o,a)=>{const c=new ry;c.setWithCredentials(!0),c.listenOnce(ty.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case ci.NO_ERROR:const l=c.getResponseJson();E(se,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(l)),o(l);break;case ci.TIMEOUT:E(se,`RPC '${e}' ${i} timed out`),a(new v(f.DEADLINE_EXCEEDED,"Request time out"));break;case ci.HTTP_ERROR:const h=c.getStatus();if(E(se,`RPC '${e}' ${i} failed with status:`,h,"response text:",c.getResponseText()),h>0){let d=c.getResponseJson();Array.isArray(d)&&(d=d[0]);const p=d==null?void 0:d.error;if(p&&p.status&&p.message){const y=function(w){const _=w.toLowerCase().replace(/_/g,"-");return Object.values(f).indexOf(_)>=0?_:f.UNKNOWN}(p.status);a(new v(y,p.message))}else a(new v(f.UNKNOWN,"Server responded with status "+c.getStatus()))}else a(new v(f.UNAVAILABLE,"Connection failed."));break;default:I()}}finally{E(se,`RPC '${e}' ${i} completed.`)}});const u=JSON.stringify(r);E(se,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",u,s,15)})}Ro(e,n,s){const r=li(),i=[this.mo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=Zm(),a=ey(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.xmlHttpFactory=new sy({})),this.Eo(c.initMessageHeaders,n,s),c.encodeInitMessageHeaders=!0;const l=i.join("");E(se,`Creating RPC '${e}' stream ${r}: ${l}`,c);const h=o.createWebChannel(l,c);let d=!1,p=!1;const y=new Kv({ro:_=>{p?E(se,`Not sending because RPC '${e}' stream ${r} is closed:`,_):(d||(E(se,`Opening RPC '${e}' stream ${r} transport.`),h.open(),d=!0),E(se,`RPC '${e}' stream ${r} sending:`,_),h.send(_))},oo:()=>h.close()}),w=(_,O,P)=>{_.listen(O,R=>{try{P(R)}catch(M){setTimeout(()=>{throw M},0)}})};return w(h,Is.EventType.OPEN,()=>{p||E(se,`RPC '${e}' stream ${r} transport opened.`)}),w(h,Is.EventType.CLOSE,()=>{p||(p=!0,E(se,`RPC '${e}' stream ${r} transport closed`),y.wo())}),w(h,Is.EventType.ERROR,_=>{p||(p=!0,Ct(se,`RPC '${e}' stream ${r} transport errored:`,_),y.wo(new v(f.UNAVAILABLE,"The operation could not be completed")))}),w(h,Is.EventType.MESSAGE,_=>{var O;if(!p){const P=_.data[0];B(!!P);const R=P,M=R.error||((O=R[0])===null||O===void 0?void 0:O.error);if(M){E(se,`RPC '${e}' stream ${r} received error:`,M);const ge=M.status;let me=function(Ve){const Ae=H[Ve];if(Ae!==void 0)return ph(Ae)}(ge),Fe=M.message;me===void 0&&(me=f.INTERNAL,Fe="Unknown error status: "+ge+" with message "+M.message),p=!0,y.wo(new v(me,Fe)),h.close()}else E(se,`RPC '${e}' stream ${r} received:`,P),y._o(P)}}),w(a,ny.STAT_EVENT,_=>{_.stat===sc.PROXY?E(se,`RPC '${e}' stream ${r} detected buffering proxy`):_.stat===sc.NOPROXY&&E(se,`RPC '${e}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{y.fo()},0),y}}function hi(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fr(t){return new iv(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(e,n,s=1e3,r=1.5,i=6e4){this.ii=e,this.timerId=n,this.Po=s,this.bo=r,this.Vo=i,this.So=0,this.Do=null,this.Co=Date.now(),this.reset()}reset(){this.So=0}xo(){this.So=this.Vo}No(e){this.cancel();const n=Math.floor(this.So+this.ko()),s=Math.max(0,Date.now()-this.Co),r=Math.max(0,n-s);r>0&&E("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.So} ms, delay with jitter: ${n} ms, last attempt: ${s} ms ago)`),this.Do=this.ii.enqueueAfterDelay(this.timerId,r,()=>(this.Co=Date.now(),e())),this.So*=this.bo,this.So<this.Po&&(this.So=this.Po),this.So>this.Vo&&(this.So=this.Vo)}Mo(){this.Do!==null&&(this.Do.skipDelay(),this.Do=null)}cancel(){this.Do!==null&&(this.Do.cancel(),this.Do=null)}ko(){return(Math.random()-.5)*this.So}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ah{constructor(e,n,s,r,i,o,a,c){this.ii=e,this.$o=s,this.Oo=r,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.Fo=0,this.Bo=null,this.Lo=null,this.stream=null,this.qo=new bh(e,n)}Uo(){return this.state===1||this.state===5||this.Ko()}Ko(){return this.state===2||this.state===3}start(){this.state!==4?this.auth():this.Go()}async stop(){this.Uo()&&await this.close(0)}Qo(){this.state=0,this.qo.reset()}jo(){this.Ko()&&this.Bo===null&&(this.Bo=this.ii.enqueueAfterDelay(this.$o,6e4,()=>this.zo()))}Wo(e){this.Ho(),this.stream.send(e)}async zo(){if(this.Ko())return this.close(0)}Ho(){this.Bo&&(this.Bo.cancel(),this.Bo=null)}Jo(){this.Lo&&(this.Lo.cancel(),this.Lo=null)}async close(e,n){this.Ho(),this.Jo(),this.qo.cancel(),this.Fo++,e!==4?this.qo.reset():n&&n.code===f.RESOURCE_EXHAUSTED?(Qe(n.toString()),Qe("Using maximum backoff delay to prevent overloading the backend."),this.qo.xo()):n&&n.code===f.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.Yo(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ao(n)}Yo(){}auth(){this.state=1;const e=this.Xo(this.Fo),n=this.Fo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([s,r])=>{this.Fo===n&&this.Zo(s,r)},s=>{e(()=>{const r=new v(f.UNKNOWN,"Fetching auth token failed: "+s.message);return this.tu(r)})})}Zo(e,n){const s=this.Xo(this.Fo);this.stream=this.eu(e,n),this.stream.uo(()=>{s(()=>(this.state=2,this.Lo=this.ii.enqueueAfterDelay(this.Oo,1e4,()=>(this.Ko()&&(this.state=3),Promise.resolve())),this.listener.uo()))}),this.stream.ao(r=>{s(()=>this.tu(r))}),this.stream.onMessage(r=>{s(()=>this.onMessage(r))})}Go(){this.state=5,this.qo.No(async()=>{this.state=0,this.start()})}tu(e){return E("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}Xo(e){return n=>{this.ii.enqueueAndForget(()=>this.Fo===e?n():(E("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Wv extends Ah{constructor(e,n,s,r,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,s,r,o),this.serializer=i}eu(e,n){return this.connection.Ro("Listen",e,n)}onMessage(e){this.qo.reset();const n=cv(this.serializer,e),s=function(r){if(!("targetChange"in r))return b.min();const i=r.targetChange;return i.targetIds&&i.targetIds.length?b.min():i.readTime?Me(i.readTime):b.min()}(e);return this.listener.nu(n,s)}su(e){const n={};n.database=Ki(this.serializer),n.addTarget=function(r,i){let o;const a=i.target;if(o=Vi(a)?{documents:hv(r,a)}:{query:dv(r,a)},o.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){o.resumeToken=yh(r,i.resumeToken);const c=ji(r,i.expectedCount);c!==null&&(o.expectedCount=c)}else if(i.snapshotVersion.compareTo(b.min())>0){o.readTime=tr(r,i.snapshotVersion.toTimestamp());const c=ji(r,i.expectedCount);c!==null&&(o.expectedCount=c)}return o}(this.serializer,e);const s=pv(this.serializer,e);s&&(n.labels=s),this.Wo(n)}iu(e){const n={};n.database=Ki(this.serializer),n.removeTarget=e,this.Wo(n)}}class Qv extends Ah{constructor(e,n,s,r,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,s,r,o),this.serializer=i,this.ru=!1}get ou(){return this.ru}start(){this.ru=!1,this.lastStreamToken=void 0,super.start()}Yo(){this.ru&&this.uu([])}eu(e,n){return this.connection.Ro("Write",e,n)}onMessage(e){if(B(!!e.streamToken),this.lastStreamToken=e.streamToken,this.ru){this.qo.reset();const n=lv(e.writeResults,e.commitTime),s=Me(e.commitTime);return this.listener.cu(s,n)}return B(!e.writeResults||e.writeResults.length===0),this.ru=!0,this.listener.au()}hu(){const e={};e.database=Ki(this.serializer),this.Wo(e)}uu(e){const n={streamToken:this.lastStreamToken,writes:e.map(s=>uv(this.serializer,s))};this.Wo(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xv extends class{}{constructor(e,n,s,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=s,this.serializer=r,this.lu=!1}fu(){if(this.lu)throw new v(f.FAILED_PRECONDITION,"The client has already been terminated.")}Io(e,n,s){return this.fu(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([r,i])=>this.connection.Io(e,n,s,r,i)).catch(r=>{throw r.name==="FirebaseError"?(r.code===f.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),r):new v(f.UNKNOWN,r.toString())})}vo(e,n,s,r){return this.fu(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.vo(e,n,s,i,o,r)).catch(i=>{throw i.name==="FirebaseError"?(i.code===f.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new v(f.UNKNOWN,i.toString())})}terminate(){this.lu=!0}}class Yv{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.wu=0,this._u=null,this.mu=!0}gu(){this.wu===0&&(this.yu("Unknown"),this._u=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._u=null,this.pu("Backend didn't respond within 10 seconds."),this.yu("Offline"),Promise.resolve())))}Iu(e){this.state==="Online"?this.yu("Unknown"):(this.wu++,this.wu>=1&&(this.Tu(),this.pu(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.yu("Offline")))}set(e){this.Tu(),this.wu=0,e==="Online"&&(this.mu=!1),this.yu(e)}yu(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}pu(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.mu?(Qe(n),this.mu=!1):E("OnlineStateTracker",n)}Tu(){this._u!==null&&(this._u.cancel(),this._u=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jv{constructor(e,n,s,r,i){this.localStore=e,this.datastore=n,this.asyncQueue=s,this.remoteSyncer={},this.Eu=[],this.Au=new Map,this.vu=new Set,this.Ru=[],this.Pu=i,this.Pu.Yr(o=>{s.enqueueAndForget(async()=>{Lt(this)&&(E("RemoteStore","Restarting streams for network reachability change."),await async function(a){const c=C(a);c.vu.add(4),await ds(c),c.bu.set("Unknown"),c.vu.delete(4),await Vr(c)}(this))})}),this.bu=new Yv(s,r)}}async function Vr(t){if(Lt(t))for(const e of t.Ru)await e(!0)}async function ds(t){for(const e of t.Ru)await e(!1)}function Ch(t,e){const n=C(t);n.Au.has(e.targetId)||(n.Au.set(e.targetId,e),Ko(n)?Ho(n):hn(n).Ko()&&zo(n,e))}function kh(t,e){const n=C(t),s=hn(n);n.Au.delete(e),s.Ko()&&Rh(n,e),n.Au.size===0&&(s.Ko()?s.jo():Lt(n)&&n.bu.set("Unknown"))}function zo(t,e){if(t.Vu.qt(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(b.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}hn(t).su(e)}function Rh(t,e){t.Vu.qt(e),hn(t).iu(e)}function Ho(t){t.Vu=new tv({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),le:e=>t.Au.get(e)||null,ue:()=>t.datastore.serializer.databaseId}),hn(t).start(),t.bu.gu()}function Ko(t){return Lt(t)&&!hn(t).Uo()&&t.Au.size>0}function Lt(t){return C(t).vu.size===0}function Nh(t){t.Vu=void 0}async function Zv(t){t.Au.forEach((e,n)=>{zo(t,e)})}async function e_(t,e){Nh(t),Ko(t)?(t.bu.Iu(e),Ho(t)):t.bu.set("Unknown")}async function t_(t,e,n){if(t.bu.set("Online"),e instanceof mh&&e.state===2&&e.cause)try{await async function(s,r){const i=r.cause;for(const o of r.targetIds)s.Au.has(o)&&(await s.remoteSyncer.rejectListen(o,i),s.Au.delete(o),s.Vu.removeTarget(o))}(t,e)}catch(s){E("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),s),await nr(t,s)}else if(e instanceof xs?t.Vu.Ht(e):e instanceof gh?t.Vu.ne(e):t.Vu.Xt(e),!n.isEqual(b.min()))try{const s=await Sh(t.localStore);n.compareTo(s)>=0&&await function(r,i){const o=r.Vu.ce(i);return o.targetChanges.forEach((a,c)=>{if(a.resumeToken.approximateByteSize()>0){const u=r.Au.get(c);u&&r.Au.set(c,u.withResumeToken(a.resumeToken,i))}}),o.targetMismatches.forEach((a,c)=>{const u=r.Au.get(a);if(!u)return;r.Au.set(a,u.withResumeToken(he.EMPTY_BYTE_STRING,u.snapshotVersion)),Rh(r,a);const l=new it(u.target,a,c,u.sequenceNumber);zo(r,l)}),r.remoteSyncer.applyRemoteEvent(o)}(t,n)}catch(s){E("RemoteStore","Failed to raise snapshot:",s),await nr(t,s)}}async function nr(t,e,n){if(!us(e))throw e;t.vu.add(1),await ds(t),t.bu.set("Offline"),n||(n=()=>Sh(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{E("RemoteStore","Retrying IndexedDB access"),await n(),t.vu.delete(1),await Vr(t)})}function Dh(t,e){return e().catch(n=>nr(t,n,e))}async function Br(t){const e=C(t),n=ht(e);let s=e.Eu.length>0?e.Eu[e.Eu.length-1].batchId:-1;for(;n_(e);)try{const r=await Bv(e.localStore,s);if(r===null){e.Eu.length===0&&n.jo();break}s=r.batchId,s_(e,r)}catch(r){await nr(e,r)}Oh(e)&&Ph(e)}function n_(t){return Lt(t)&&t.Eu.length<10}function s_(t,e){t.Eu.push(e);const n=ht(t);n.Ko()&&n.ou&&n.uu(e.mutations)}function Oh(t){return Lt(t)&&!ht(t).Uo()&&t.Eu.length>0}function Ph(t){ht(t).start()}async function r_(t){ht(t).hu()}async function i_(t){const e=ht(t);for(const n of t.Eu)e.uu(n.mutations)}async function o_(t,e,n){const s=t.Eu.shift(),r=Fo.from(s,e,n);await Dh(t,()=>t.remoteSyncer.applySuccessfulWrite(r)),await Br(t)}async function a_(t,e){e&&ht(t).ou&&await async function(n,s){if(r=s.code,Jy(r)&&r!==f.ABORTED){const i=n.Eu.shift();ht(n).Qo(),await Dh(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Br(n)}var r}(t,e),Oh(t)&&Ph(t)}async function Rc(t,e){const n=C(t);n.asyncQueue.verifyOperationInProgress(),E("RemoteStore","RemoteStore received new credentials");const s=Lt(n);n.vu.add(3),await ds(n),s&&n.bu.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.vu.delete(3),await Vr(n)}async function c_(t,e){const n=C(t);e?(n.vu.delete(2),await Vr(n)):e||(n.vu.add(2),await ds(n),n.bu.set("Unknown"))}function hn(t){return t.Su||(t.Su=function(e,n,s){const r=C(e);return r.fu(),new Wv(n,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,s)}(t.datastore,t.asyncQueue,{uo:Zv.bind(null,t),ao:e_.bind(null,t),nu:t_.bind(null,t)}),t.Ru.push(async e=>{e?(t.Su.Qo(),Ko(t)?Ho(t):t.bu.set("Unknown")):(await t.Su.stop(),Nh(t))})),t.Su}function ht(t){return t.Du||(t.Du=function(e,n,s){const r=C(e);return r.fu(),new Qv(n,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,s)}(t.datastore,t.asyncQueue,{uo:r_.bind(null,t),ao:a_.bind(null,t),au:i_.bind(null,t),cu:o_.bind(null,t)}),t.Ru.push(async e=>{e?(t.Du.Qo(),await Br(t)):(await t.Du.stop(),t.Eu.length>0&&(E("RemoteStore",`Stopping write stream with ${t.Eu.length} pending writes`),t.Eu=[]))})),t.Du}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Go{constructor(e,n,s,r,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=s,this.op=r,this.removalCallback=i,this.deferred=new ze,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}static createAndSchedule(e,n,s,r,i){const o=Date.now()+s,a=new Go(e,n,o,r,i);return a.start(s),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new v(f.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wo(t,e){if(Qe("AsyncQueue",`${e}: ${t}`),us(t))return new v(f.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(e){this.comparator=e?(n,s)=>e(n,s)||T.comparator(n.key,s.key):(n,s)=>T.comparator(n.key,s.key),this.keyedMap=In(),this.sortedSet=new q(this.comparator)}static emptySet(e){return new Qt(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,s)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Qt)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;n.hasNext();){const r=n.getNext().key,i=s.getNext().key;if(!r.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const s=new Qt;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=n,s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(){this.Cu=new q(T.comparator)}track(e){const n=e.doc.key,s=this.Cu.get(n);s?e.type!==0&&s.type===3?this.Cu=this.Cu.insert(n,e):e.type===3&&s.type!==1?this.Cu=this.Cu.insert(n,{type:s.type,doc:e.doc}):e.type===2&&s.type===2?this.Cu=this.Cu.insert(n,{type:2,doc:e.doc}):e.type===2&&s.type===0?this.Cu=this.Cu.insert(n,{type:0,doc:e.doc}):e.type===1&&s.type===0?this.Cu=this.Cu.remove(n):e.type===1&&s.type===2?this.Cu=this.Cu.insert(n,{type:1,doc:s.doc}):e.type===0&&s.type===1?this.Cu=this.Cu.insert(n,{type:2,doc:e.doc}):I():this.Cu=this.Cu.insert(n,e)}xu(){const e=[];return this.Cu.inorderTraversal((n,s)=>{e.push(s)}),e}}class rn{constructor(e,n,s,r,i,o,a,c,u){this.query=e,this.docs=n,this.oldDocs=s,this.docChanges=r,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,n,s,r,i){const o=[];return n.forEach(a=>{o.push({type:0,doc:a})}),new rn(e,n,Qt.emptySet(n),o,s,r,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Dr(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,s=e.docChanges;if(n.length!==s.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==s[r].type||!n[r].doc.isEqual(s[r].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u_{constructor(){this.Nu=void 0,this.listeners=[]}}class l_{constructor(){this.queries=new ln(e=>eh(e),Dr),this.onlineState="Unknown",this.ku=new Set}}async function Qo(t,e){const n=C(t),s=e.query;let r=!1,i=n.queries.get(s);if(i||(r=!0,i=new u_),r)try{i.Nu=await n.onListen(s)}catch(o){const a=Wo(o,`Initialization of query '${qi(e.query)}' failed`);return void e.onError(a)}n.queries.set(s,i),i.listeners.push(e),e.Mu(n.onlineState),i.Nu&&e.$u(i.Nu)&&Yo(n)}async function Xo(t,e){const n=C(t),s=e.query;let r=!1;const i=n.queries.get(s);if(i){const o=i.listeners.indexOf(e);o>=0&&(i.listeners.splice(o,1),r=i.listeners.length===0)}if(r)return n.queries.delete(s),n.onUnlisten(s)}function h_(t,e){const n=C(t);let s=!1;for(const r of e){const i=r.query,o=n.queries.get(i);if(o){for(const a of o.listeners)a.$u(r)&&(s=!0);o.Nu=r}}s&&Yo(n)}function d_(t,e,n){const s=C(t),r=s.queries.get(e);if(r)for(const i of r.listeners)i.onError(n);s.queries.delete(e)}function Yo(t){t.ku.forEach(e=>{e.next()})}class Jo{constructor(e,n,s){this.query=e,this.Ou=n,this.Fu=!1,this.Bu=null,this.onlineState="Unknown",this.options=s||{}}$u(e){if(!this.options.includeMetadataChanges){const s=[];for(const r of e.docChanges)r.type!==3&&s.push(r);e=new rn(e.query,e.docs,e.oldDocs,s,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Fu?this.Lu(e)&&(this.Ou.next(e),n=!0):this.qu(e,this.onlineState)&&(this.Uu(e),n=!0),this.Bu=e,n}onError(e){this.Ou.error(e)}Mu(e){this.onlineState=e;let n=!1;return this.Bu&&!this.Fu&&this.qu(this.Bu,e)&&(this.Uu(this.Bu),n=!0),n}qu(e,n){if(!e.fromCache)return!0;const s=n!=="Offline";return(!this.options.Ku||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Lu(e){if(e.docChanges.length>0)return!0;const n=this.Bu&&this.Bu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}Uu(e){e=rn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Ou.next(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mh{constructor(e){this.key=e}}class Lh{constructor(e){this.key=e}}class f_{constructor(e,n){this.query=e,this.Yu=n,this.Xu=null,this.hasCachedResults=!1,this.current=!1,this.Zu=k(),this.mutatedKeys=k(),this.tc=th(e),this.ec=new Qt(this.tc)}get nc(){return this.Yu}sc(e,n){const s=n?n.ic:new Nc,r=n?n.ec:this.ec;let i=n?n.mutatedKeys:this.mutatedKeys,o=r,a=!1;const c=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,u=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((l,h)=>{const d=r.get(l),p=Or(this.query,h)?h:null,y=!!d&&this.mutatedKeys.has(d.key),w=!!p&&(p.hasLocalMutations||this.mutatedKeys.has(p.key)&&p.hasCommittedMutations);let _=!1;d&&p?d.data.isEqual(p.data)?y!==w&&(s.track({type:3,doc:p}),_=!0):this.rc(d,p)||(s.track({type:2,doc:p}),_=!0,(c&&this.tc(p,c)>0||u&&this.tc(p,u)<0)&&(a=!0)):!d&&p?(s.track({type:0,doc:p}),_=!0):d&&!p&&(s.track({type:1,doc:d}),_=!0,(c||u)&&(a=!0)),_&&(p?(o=o.add(p),i=w?i.add(l):i.delete(l)):(o=o.delete(l),i=i.delete(l)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const l=this.query.limitType==="F"?o.last():o.first();o=o.delete(l.key),i=i.delete(l.key),s.track({type:1,doc:l})}return{ec:o,ic:s,zi:a,mutatedKeys:i}}rc(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,s){const r=this.ec;this.ec=e.ec,this.mutatedKeys=e.mutatedKeys;const i=e.ic.xu();i.sort((u,l)=>function(h,d){const p=y=>{switch(y){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return I()}};return p(h)-p(d)}(u.type,l.type)||this.tc(u.doc,l.doc)),this.oc(s);const o=n?this.uc():[],a=this.Zu.size===0&&this.current?1:0,c=a!==this.Xu;return this.Xu=a,i.length!==0||c?{snapshot:new rn(this.query,e.ec,r,i,e.mutatedKeys,a===0,c,!1,!!s&&s.resumeToken.approximateByteSize()>0),cc:o}:{cc:o}}Mu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({ec:this.ec,ic:new Nc,mutatedKeys:this.mutatedKeys,zi:!1},!1)):{cc:[]}}ac(e){return!this.Yu.has(e)&&!!this.ec.has(e)&&!this.ec.get(e).hasLocalMutations}oc(e){e&&(e.addedDocuments.forEach(n=>this.Yu=this.Yu.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Yu=this.Yu.delete(n)),this.current=e.current)}uc(){if(!this.current)return[];const e=this.Zu;this.Zu=k(),this.ec.forEach(s=>{this.ac(s.key)&&(this.Zu=this.Zu.add(s.key))});const n=[];return e.forEach(s=>{this.Zu.has(s)||n.push(new Lh(s))}),this.Zu.forEach(s=>{e.has(s)||n.push(new Mh(s))}),n}hc(e){this.Yu=e.ir,this.Zu=k();const n=this.sc(e.documents);return this.applyChanges(n,!0)}lc(){return rn.fromInitialDocuments(this.query,this.ec,this.mutatedKeys,this.Xu===0,this.hasCachedResults)}}class p_{constructor(e,n,s){this.query=e,this.targetId=n,this.view=s}}class g_{constructor(e){this.key=e,this.fc=!1}}class m_{constructor(e,n,s,r,i,o){this.localStore=e,this.remoteStore=n,this.eventManager=s,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.dc={},this.wc=new ln(a=>eh(a),Dr),this._c=new Map,this.mc=new Set,this.gc=new q(T.comparator),this.yc=new Map,this.Ic=new $o,this.Tc={},this.Ec=new Map,this.Ac=sn.Mn(),this.onlineState="Unknown",this.vc=void 0}get isPrimaryClient(){return this.vc===!0}}async function y_(t,e){const n=C_(t);let s,r;const i=n.wc.get(e);if(i)s=i.targetId,n.sharedClientState.addLocalQueryTarget(s),r=i.view.lc();else{const o=await $v(n.localStore,Xe(e)),a=n.sharedClientState.addLocalQueryTarget(o.targetId);s=o.targetId,r=await v_(n,e,s,a==="current",o.resumeToken),n.isPrimaryClient&&Ch(n.remoteStore,o)}return r}async function v_(t,e,n,s,r){t.Rc=(h,d,p)=>async function(y,w,_,O){let P=w.view.sc(_);P.zi&&(P=await Ac(y.localStore,w.query,!1).then(({documents:ge})=>w.view.sc(ge,P)));const R=O&&O.targetChanges.get(w.targetId),M=w.view.applyChanges(P,y.isPrimaryClient,R);return Oc(y,w.targetId,M.cc),M.snapshot}(t,h,d,p);const i=await Ac(t.localStore,e,!0),o=new f_(e,i.ir),a=o.sc(i.documents),c=hs.createSynthesizedTargetChangeForCurrentChange(n,s&&t.onlineState!=="Offline",r),u=o.applyChanges(a,t.isPrimaryClient,c);Oc(t,n,u.cc);const l=new p_(e,n,o);return t.wc.set(e,l),t._c.has(n)?t._c.get(n).push(e):t._c.set(n,[e]),u.snapshot}async function __(t,e){const n=C(t),s=n.wc.get(e),r=n._c.get(s.targetId);if(r.length>1)return n._c.set(s.targetId,r.filter(i=>!Dr(i,e))),void n.wc.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Gi(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),kh(n.remoteStore,s.targetId),Wi(n,s.targetId)}).catch(cs)):(Wi(n,s.targetId),await Gi(n.localStore,s.targetId,!0))}async function w_(t,e,n){const s=k_(t);try{const r=await function(i,o){const a=C(i),c=W.now(),u=o.reduce((d,p)=>d.add(p.key),k());let l,h;return a.persistence.runTransaction("Locally write mutations","readwrite",d=>{let p=Ye(),y=k();return a.Zi.getEntries(d,u).next(w=>{p=w,p.forEach((_,O)=>{O.isValidDocument()||(y=y.add(_))})}).next(()=>a.localDocuments.getOverlayedDocuments(d,p)).next(w=>{l=w;const _=[];for(const O of o){const P=Gy(O,l.get(O.key).overlayedDocument);P!=null&&_.push(new pt(O.key,P,Kl(P.value.mapValue),pe.exists(!0)))}return a.mutationQueue.addMutationBatch(d,c,_,o)}).next(w=>{h=w;const _=w.applyToLocalDocumentSet(l,y);return a.documentOverlayCache.saveOverlays(d,w.batchId,_)})}).then(()=>({batchId:h.batchId,changes:sh(l)}))}(s.localStore,e);s.sharedClientState.addPendingMutation(r.batchId),function(i,o,a){let c=i.Tc[i.currentUser.toKey()];c||(c=new q(L)),c=c.insert(o,a),i.Tc[i.currentUser.toKey()]=c}(s,r.batchId,n),await fs(s,r.changes),await Br(s.remoteStore)}catch(r){const i=Wo(r,"Failed to persist write");n.reject(i)}}async function xh(t,e){const n=C(t);try{const s=await Fv(n.localStore,e);e.targetChanges.forEach((r,i)=>{const o=n.yc.get(i);o&&(B(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1),r.addedDocuments.size>0?o.fc=!0:r.modifiedDocuments.size>0?B(o.fc):r.removedDocuments.size>0&&(B(o.fc),o.fc=!1))}),await fs(n,s,e)}catch(s){await cs(s)}}function Dc(t,e,n){const s=C(t);if(s.isPrimaryClient&&n===0||!s.isPrimaryClient&&n===1){const r=[];s.wc.forEach((i,o)=>{const a=o.view.Mu(e);a.snapshot&&r.push(a.snapshot)}),function(i,o){const a=C(i);a.onlineState=o;let c=!1;a.queries.forEach((u,l)=>{for(const h of l.listeners)h.Mu(o)&&(c=!0)}),c&&Yo(a)}(s.eventManager,e),r.length&&s.dc.nu(r),s.onlineState=e,s.isPrimaryClient&&s.sharedClientState.setOnlineState(e)}}async function E_(t,e,n){const s=C(t);s.sharedClientState.updateQueryState(e,"rejected",n);const r=s.yc.get(e),i=r&&r.key;if(i){let o=new q(T.comparator);o=o.insert(i,ie.newNoDocument(i,b.min()));const a=k().add(i),c=new Ur(b.min(),new Map,new q(L),o,a);await xh(s,c),s.gc=s.gc.remove(i),s.yc.delete(e),Zo(s)}else await Gi(s.localStore,e,!1).then(()=>Wi(s,e,n)).catch(cs)}async function T_(t,e){const n=C(t),s=e.batch.batchId;try{const r=await Uv(n.localStore,e);Fh(n,s,null),Uh(n,s),n.sharedClientState.updateMutationState(s,"acknowledged"),await fs(n,r)}catch(r){await cs(r)}}async function I_(t,e,n){const s=C(t);try{const r=await function(i,o){const a=C(i);return a.persistence.runTransaction("Reject batch","readwrite-primary",c=>{let u;return a.mutationQueue.lookupMutationBatch(c,o).next(l=>(B(l!==null),u=l.keys(),a.mutationQueue.removeMutationBatch(c,l))).next(()=>a.mutationQueue.performConsistencyCheck(c)).next(()=>a.documentOverlayCache.removeOverlaysForBatchId(c,u,o)).next(()=>a.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,u)).next(()=>a.localDocuments.getDocuments(c,u))})}(s.localStore,e);Fh(s,e,n),Uh(s,e),s.sharedClientState.updateMutationState(e,"rejected",n),await fs(s,r)}catch(r){await cs(r)}}function Uh(t,e){(t.Ec.get(e)||[]).forEach(n=>{n.resolve()}),t.Ec.delete(e)}function Fh(t,e,n){const s=C(t);let r=s.Tc[s.currentUser.toKey()];if(r){const i=r.get(e);i&&(n?i.reject(n):i.resolve(),r=r.remove(e)),s.Tc[s.currentUser.toKey()]=r}}function Wi(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const s of t._c.get(e))t.wc.delete(s),n&&t.dc.Pc(s,n);t._c.delete(e),t.isPrimaryClient&&t.Ic.Is(e).forEach(s=>{t.Ic.containsKey(s)||Vh(t,s)})}function Vh(t,e){t.mc.delete(e.path.canonicalString());const n=t.gc.get(e);n!==null&&(kh(t.remoteStore,n),t.gc=t.gc.remove(e),t.yc.delete(n),Zo(t))}function Oc(t,e,n){for(const s of n)s instanceof Mh?(t.Ic.addReference(s.key,e),S_(t,s)):s instanceof Lh?(E("SyncEngine","Document no longer in limbo: "+s.key),t.Ic.removeReference(s.key,e),t.Ic.containsKey(s.key)||Vh(t,s.key)):I()}function S_(t,e){const n=e.key,s=n.path.canonicalString();t.gc.get(n)||t.mc.has(s)||(E("SyncEngine","New document in limbo: "+n),t.mc.add(s),Zo(t))}function Zo(t){for(;t.mc.size>0&&t.gc.size<t.maxConcurrentLimboResolutions;){const e=t.mc.values().next().value;t.mc.delete(e);const n=new T(V.fromString(e)),s=t.Ac.next();t.yc.set(s,new g_(n)),t.gc=t.gc.insert(n,s),Ch(t.remoteStore,new it(Xe(Rr(n.path)),s,"TargetPurposeLimboResolution",Do.ct))}}async function fs(t,e,n){const s=C(t),r=[],i=[],o=[];s.wc.isEmpty()||(s.wc.forEach((a,c)=>{o.push(s.Rc(c,e,n).then(u=>{if((u||n)&&s.isPrimaryClient&&s.sharedClientState.updateQueryState(c.targetId,u!=null&&u.fromCache?"not-current":"current"),u){r.push(u);const l=jo.Li(c.targetId,u);i.push(l)}}))}),await Promise.all(o),s.dc.nu(r),await async function(a,c){const u=C(a);try{await u.persistence.runTransaction("notifyLocalViewChanges","readwrite",l=>g.forEach(c,h=>g.forEach(h.Fi,d=>u.persistence.referenceDelegate.addReference(l,h.targetId,d)).next(()=>g.forEach(h.Bi,d=>u.persistence.referenceDelegate.removeReference(l,h.targetId,d)))))}catch(l){if(!us(l))throw l;E("LocalStore","Failed to update sequence numbers: "+l)}for(const l of c){const h=l.targetId;if(!l.fromCache){const d=u.Ji.get(h),p=d.snapshotVersion,y=d.withLastLimboFreeSnapshotVersion(p);u.Ji=u.Ji.insert(h,y)}}}(s.localStore,i))}async function b_(t,e){const n=C(t);if(!n.currentUser.isEqual(e)){E("SyncEngine","User change. New user:",e.toKey());const s=await Ih(n.localStore,e);n.currentUser=e,function(r,i){r.Ec.forEach(o=>{o.forEach(a=>{a.reject(new v(f.CANCELLED,i))})}),r.Ec.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,s.removedBatchIds,s.addedBatchIds),await fs(n,s.er)}}function A_(t,e){const n=C(t),s=n.yc.get(e);if(s&&s.fc)return k().add(s.key);{let r=k();const i=n._c.get(e);if(!i)return r;for(const o of i){const a=n.wc.get(o);r=r.unionWith(a.view.nc)}return r}}function C_(t){const e=C(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=xh.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=A_.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=E_.bind(null,e),e.dc.nu=h_.bind(null,e.eventManager),e.dc.Pc=d_.bind(null,e.eventManager),e}function k_(t){const e=C(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=T_.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=I_.bind(null,e),e}class Pc{constructor(){this.synchronizeTabs=!1}async initialize(e){this.serializer=Fr(e.databaseInfo.databaseId),this.sharedClientState=this.createSharedClientState(e),this.persistence=this.createPersistence(e),await this.persistence.start(),this.localStore=this.createLocalStore(e),this.gcScheduler=this.createGarbageCollectionScheduler(e,this.localStore),this.indexBackfillerScheduler=this.createIndexBackfillerScheduler(e,this.localStore)}createGarbageCollectionScheduler(e,n){return null}createIndexBackfillerScheduler(e,n){return null}createLocalStore(e){return xv(this.persistence,new Mv,e.initialUser,this.serializer)}createPersistence(e){return new Ov(qo.zs,this.serializer)}createSharedClientState(e){return new jv}async terminate(){this.gcScheduler&&this.gcScheduler.stop(),await this.sharedClientState.shutdown(),await this.persistence.shutdown()}}class R_{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>Dc(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=b_.bind(null,this.syncEngine),await c_(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new l_}createDatastore(e){const n=Fr(e.databaseInfo.databaseId),s=(r=e.databaseInfo,new Gv(r));var r;return function(i,o,a,c){return new Xv(i,o,a,c)}(e.authCredentials,e.appCheckCredentials,s,n)}createRemoteStore(e){return n=this.localStore,s=this.datastore,r=e.asyncQueue,i=a=>Dc(this.syncEngine,a,0),o=kc.D()?new kc:new zv,new Jv(n,s,r,i,o);var n,s,r,i,o}createSyncEngine(e,n){return function(s,r,i,o,a,c,u){const l=new m_(s,r,i,o,a,c);return u&&(l.vc=!0),l}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}terminate(){return async function(e){const n=C(e);E("RemoteStore","RemoteStore shutting down."),n.vu.add(5),await ds(n),n.Pu.shutdown(),n.bu.set("Unknown")}(this.remoteStore)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ea{constructor(e){this.observer=e,this.muted=!1}next(e){this.observer.next&&this.Sc(this.observer.next,e)}error(e){this.observer.error?this.Sc(this.observer.error,e):Qe("Uncaught Error in snapshot listener:",e.toString())}Dc(){this.muted=!0}Sc(e,n){this.muted||setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N_{constructor(e,n,s,r){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=s,this.databaseInfo=r,this.user=re.UNAUTHENTICATED,this.clientId=jl.A(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this.authCredentials.start(s,async i=>{E("FirestoreClient","Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(s,i=>(E("FirestoreClient","Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}async getConfiguration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}verifyNotTerminated(){if(this.asyncQueue.isShuttingDown)throw new v(f.FAILED_PRECONDITION,"The client has already been terminated.")}terminate(){this.asyncQueue.enterRestrictedMode();const e=new ze;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const s=Wo(n,"Failed to shutdown persistence");e.reject(s)}}),e.promise}}async function di(t,e){t.asyncQueue.verifyOperationInProgress(),E("FirestoreClient","Initializing OfflineComponentProvider");const n=await t.getConfiguration();await e.initialize(n);let s=n.initialUser;t.setCredentialChangeListener(async r=>{s.isEqual(r)||(await Ih(e.localStore,r),s=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Mc(t,e){t.asyncQueue.verifyOperationInProgress();const n=await O_(t);E("FirestoreClient","Initializing OnlineComponentProvider");const s=await t.getConfiguration();await e.initialize(n,s),t.setCredentialChangeListener(r=>Rc(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>Rc(e.remoteStore,i)),t._onlineComponents=e}function D_(t){return t.name==="FirebaseError"?t.code===f.FAILED_PRECONDITION||t.code===f.UNIMPLEMENTED:!(typeof DOMException<"u"&&t instanceof DOMException)||t.code===22||t.code===20||t.code===11}async function O_(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){E("FirestoreClient","Using user provided OfflineComponentProvider");try{await di(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!D_(n))throw n;Ct("Error using user provided cache. Falling back to memory cache: "+n),await di(t,new Pc)}}else E("FirestoreClient","Using default OfflineComponentProvider"),await di(t,new Pc);return t._offlineComponents}async function Bh(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(E("FirestoreClient","Using user provided OnlineComponentProvider"),await Mc(t,t._uninitializedComponentsProvider._online)):(E("FirestoreClient","Using default OnlineComponentProvider"),await Mc(t,new R_))),t._onlineComponents}function P_(t){return Bh(t).then(e=>e.syncEngine)}async function sr(t){const e=await Bh(t),n=e.eventManager;return n.onListen=y_.bind(null,e.syncEngine),n.onUnlisten=__.bind(null,e.syncEngine),n}function M_(t,e,n={}){const s=new ze;return t.asyncQueue.enqueueAndForget(async()=>function(r,i,o,a,c){const u=new ea({next:h=>{i.enqueueAndForget(()=>Xo(r,l));const d=h.docs.has(o);!d&&h.fromCache?c.reject(new v(f.UNAVAILABLE,"Failed to get document because the client is offline.")):d&&h.fromCache&&a&&a.source==="server"?c.reject(new v(f.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):c.resolve(h)},error:h=>c.reject(h)}),l=new Jo(Rr(o.path),u,{includeMetadataChanges:!0,Ku:!0});return Qo(r,l)}(await sr(t),t.asyncQueue,e,n,s)),s.promise}function L_(t,e,n={}){const s=new ze;return t.asyncQueue.enqueueAndForget(async()=>function(r,i,o,a,c){const u=new ea({next:h=>{i.enqueueAndForget(()=>Xo(r,l)),h.fromCache&&a.source==="server"?c.reject(new v(f.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(h)},error:h=>c.reject(h)}),l=new Jo(o,u,{includeMetadataChanges:!0,Ku:!0});return Qo(r,l)}(await sr(t),t.asyncQueue,e,n,s)),s.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $h(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lc=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qh(t,e,n){if(!n)throw new v(f.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function jh(t,e,n,s){if(e===!0&&s===!0)throw new v(f.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function xc(t){if(!T.isDocumentKey(t))throw new v(f.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Uc(t){if(T.isDocumentKey(t))throw new v(f.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function $r(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(n){return n.constructor?n.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":I()}function ue(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new v(f.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=$r(t);throw new v(f.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(e){var n,s;if(e.host===void 0){if(e.ssl!==void 0)throw new v(f.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.cache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new v(f.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}jh("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=$h((s=e.experimentalLongPollingOptions)!==null&&s!==void 0?s:{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new v(f.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new v(f.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new v(f.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(n=this.experimentalLongPollingOptions,s=e.experimentalLongPollingOptions,n.timeoutSeconds===s.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams;var n,s}}class qr{constructor(e,n,s,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=s,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Fc({}),this._settingsFrozen=!1}get app(){if(!this._app)throw new v(f.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!==void 0}_setSettings(e){if(this._settingsFrozen)throw new v(f.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Fc(e),e.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new ql;switch(n.type){case"firstParty":return new uy(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new v(f.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=Lc.get(e);n&&(E("ComponentProvider","Removing Datastore"),Lc.delete(e),n.terminate())}(this),Promise.resolve()}}function zh(t,e,n,s={}){var r;const i=(t=ue(t,qr))._getSettings(),o=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==o&&Ct("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:o,ssl:!1})),s.mockUserToken){let a,c;if(typeof s.mockUserToken=="string")a=s.mockUserToken,c=re.MOCK_USER;else{a=tu(s.mockUserToken,(r=t._app)===null||r===void 0?void 0:r.options.projectId);const u=s.mockUserToken.sub||s.mockUserToken.user_id;if(!u)throw new v(f.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new re(u)}t._authCredentials=new oy(new $l(a,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(e,n,s){this.converter=n,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new He(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ne(this.firestore,e,this._key)}}class Je{constructor(e,n,s){this.converter=n,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new Je(this.firestore,e,this._query)}}class He extends Je{constructor(e,n,s){super(e,n,Rr(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ne(this.firestore,null,new T(e))}withConverter(e){return new He(this.firestore,e,this._path)}}function x_(t,e,...n){if(t=U(t),qh("collection","path",e),t instanceof qr){const s=V.fromString(e,...n);return Uc(s),new He(t,null,s)}{if(!(t instanceof ne||t instanceof He))throw new v(f.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=t._path.child(V.fromString(e,...n));return Uc(s),new He(t.firestore,null,s)}}function Hh(t,e,...n){if(t=U(t),arguments.length===1&&(e=jl.A()),qh("doc","path",e),t instanceof qr){const s=V.fromString(e,...n);return xc(s),new ne(t,null,new T(s))}{if(!(t instanceof ne||t instanceof He))throw new v(f.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=t._path.child(V.fromString(e,...n));return xc(s),new ne(t.firestore,t instanceof He?t.converter:null,new T(s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U_{constructor(){this.Gc=Promise.resolve(),this.Qc=[],this.jc=!1,this.zc=[],this.Wc=null,this.Hc=!1,this.Jc=!1,this.Yc=[],this.qo=new bh(this,"async_queue_retry"),this.Xc=()=>{const n=hi();n&&E("AsyncQueue","Visibility state changed to "+n.visibilityState),this.qo.Mo()};const e=hi();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.Xc)}get isShuttingDown(){return this.jc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Zc(),this.ta(e)}enterRestrictedMode(e){if(!this.jc){this.jc=!0,this.Jc=e||!1;const n=hi();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Xc)}}enqueue(e){if(this.Zc(),this.jc)return new Promise(()=>{});const n=new ze;return this.ta(()=>this.jc&&this.Jc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Qc.push(e),this.ea()))}async ea(){if(this.Qc.length!==0){try{await this.Qc[0](),this.Qc.shift(),this.qo.reset()}catch(e){if(!us(e))throw e;E("AsyncQueue","Operation failed with retryable error: "+e)}this.Qc.length>0&&this.qo.No(()=>this.ea())}}ta(e){const n=this.Gc.then(()=>(this.Hc=!0,e().catch(s=>{this.Wc=s,this.Hc=!1;const r=function(i){let o=i.message||"";return i.stack&&(o=i.stack.includes(i.message)?i.stack:i.message+`
`+i.stack),o}(s);throw Qe("INTERNAL UNHANDLED ERROR: ",r),s}).then(s=>(this.Hc=!1,s))));return this.Gc=n,n}enqueueAfterDelay(e,n,s){this.Zc(),this.Yc.indexOf(e)>-1&&(n=0);const r=Go.createAndSchedule(this,e,n,s,i=>this.na(i));return this.zc.push(r),r}Zc(){this.Wc&&I()}verifyOperationInProgress(){}async sa(){let e;do e=this.Gc,await e;while(e!==this.Gc)}ia(e){for(const n of this.zc)if(n.timerId===e)return!0;return!1}ra(e){return this.sa().then(()=>{this.zc.sort((n,s)=>n.targetTimeMs-s.targetTimeMs);for(const n of this.zc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.sa()})}oa(e){this.Yc.push(e)}na(e){const n=this.zc.indexOf(e);this.zc.splice(n,1)}}function Vc(t){return function(e,n){if(typeof e!="object"||e===null)return!1;const s=e;for(const r of n)if(r in s&&typeof s[r]=="function")return!0;return!1}(t,["next","error","complete"])}class be extends qr{constructor(e,n,s,r){super(e,n,s,r),this.type="firestore",this._queue=new U_,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}_terminate(){return this._firestoreClient||Kh(this),this._firestoreClient.terminate()}}function F_(t,e){const n=typeof t=="object"?t:Zi(),s=typeof t=="string"?t:"(default)",r=ar(n,"firestore").getImmediate({identifier:s});if(!r._initialized){const i=Jc("firestore");i&&zh(r,...i)}return r}function dn(t){return t._firestoreClient||Kh(t),t._firestoreClient.verifyNotTerminated(),t._firestoreClient}function Kh(t){var e,n,s;const r=t._freezeSettings(),i=function(o,a,c,u){return new Ey(o,a,c,u.host,u.ssl,u.experimentalForceLongPolling,u.experimentalAutoDetectLongPolling,$h(u.experimentalLongPollingOptions),u.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,r);t._firestoreClient=new N_(t._authCredentials,t._appCheckCredentials,t._queue,i),!((n=r.cache)===null||n===void 0)&&n._offlineComponentProvider&&(!((s=r.cache)===null||s===void 0)&&s._onlineComponentProvider)&&(t._firestoreClient._uninitializedComponentsProvider={_offlineKind:r.cache.kind,_offline:r.cache._offlineComponentProvider,_online:r.cache._onlineComponentProvider})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Nt(he.fromBase64String(e))}catch(n){throw new v(f.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new Nt(he.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new v(f.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ee(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pn{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new v(f.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new v(f.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return L(this._lat,e._lat)||L(this._long,e._long)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V_=/^__.*__$/;class B_{constructor(e,n,s){this.data=e,this.fieldMask=n,this.fieldTransforms=s}toMutation(e,n){return this.fieldMask!==null?new pt(e,this.data,this.fieldMask,n,this.fieldTransforms):new ls(e,this.data,n,this.fieldTransforms)}}class Gh{constructor(e,n,s){this.data=e,this.fieldMask=n,this.fieldTransforms=s}toMutation(e,n){return new pt(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function Wh(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw I()}}class zr{constructor(e,n,s,r,i,o){this.settings=e,this.databaseId=n,this.serializer=s,this.ignoreUndefinedProperties=r,i===void 0&&this.ua(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get ca(){return this.settings.ca}aa(e){return new zr(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}ha(e){var n;const s=(n=this.path)===null||n===void 0?void 0:n.child(e),r=this.aa({path:s,la:!1});return r.fa(e),r}da(e){var n;const s=(n=this.path)===null||n===void 0?void 0:n.child(e),r=this.aa({path:s,la:!1});return r.ua(),r}wa(e){return this.aa({path:void 0,la:!0})}_a(e){return rr(e,this.settings.methodName,this.settings.ma||!1,this.path,this.settings.ga)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}ua(){if(this.path)for(let e=0;e<this.path.length;e++)this.fa(this.path.get(e))}fa(e){if(e.length===0)throw this._a("Document fields must not be empty");if(Wh(this.ca)&&V_.test(e))throw this._a('Document fields cannot begin and end with "__"')}}class $_{constructor(e,n,s){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=s||Fr(e)}ya(e,n,s,r=!1){return new zr({ca:e,methodName:n,ga:s,path:ee.emptyPath(),la:!1,ma:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function ps(t){const e=t._freezeSettings(),n=Fr(t._databaseId);return new $_(t._databaseId,!!e.ignoreUndefinedProperties,n)}function ta(t,e,n,s,r,i={}){const o=t.ya(i.merge||i.mergeFields?2:0,e,n,r);sa("Data must be an object, but it was:",o,s);const a=Yh(s,o);let c,u;if(i.merge)c=new _e(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const l=[];for(const h of i.mergeFields){const d=Qi(e,h,n);if(!o.contains(d))throw new v(f.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);Zh(l,d)||l.push(d)}c=new _e(l),u=o.fieldTransforms.filter(h=>c.covers(h.field))}else c=null,u=o.fieldTransforms;return new B_(new ve(a),c,u)}class gs extends pn{_toFieldTransform(e){if(e.ca!==2)throw e.ca===1?e._a(`${this._methodName}() can only appear at the top level of your update data`):e._a(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof gs}}function q_(t,e,n){return new zr({ca:3,ga:e.settings.ga,methodName:t._methodName,la:n},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class na extends pn{_toFieldTransform(e){return new hh(e.path,new Kn)}isEqual(e){return e instanceof na}}class j_ extends pn{constructor(e,n){super(e),this.pa=n}_toFieldTransform(e){const n=q_(this,e,!0),s=this.pa.map(i=>gn(i,n)),r=new nn(s);return new hh(e.path,r)}isEqual(e){return this===e}}function Qh(t,e,n,s){const r=t.ya(1,e,n);sa("Data must be an object, but it was:",r,s);const i=[],o=ve.empty();Mt(s,(c,u)=>{const l=ra(e,c,n);u=U(u);const h=r.da(l);if(u instanceof gs)i.push(l);else{const d=gn(u,h);d!=null&&(i.push(l),o.set(l,d))}});const a=new _e(i);return new Gh(o,a,r.fieldTransforms)}function Xh(t,e,n,s,r,i){const o=t.ya(1,e,n),a=[Qi(e,s,n)],c=[r];if(i.length%2!=0)throw new v(f.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)a.push(Qi(e,i[d])),c.push(i[d+1]);const u=[],l=ve.empty();for(let d=a.length-1;d>=0;--d)if(!Zh(u,a[d])){const p=a[d];let y=c[d];y=U(y);const w=o.da(p);if(y instanceof gs)u.push(p);else{const _=gn(y,w);_!=null&&(u.push(p),l.set(p,_))}}const h=new _e(u);return new Gh(l,h,o.fieldTransforms)}function z_(t,e,n,s=!1){return gn(n,t.ya(s?4:3,e))}function gn(t,e){if(Jh(t=U(t)))return sa("Unsupported field value:",e,t),Yh(t,e);if(t instanceof pn)return function(n,s){if(!Wh(s.ca))throw s._a(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s._a(`${n._methodName}() is not currently supported inside arrays`);const r=n._toFieldTransform(s);r&&s.fieldTransforms.push(r)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.la&&e.ca!==4)throw e._a("Nested arrays are not supported");return function(n,s){const r=[];let i=0;for(const o of n){let a=gn(o,s.wa(i));a==null&&(a={nullValue:"NULL_VALUE"}),r.push(a),i++}return{arrayValue:{values:r}}}(t,e)}return function(n,s){if((n=U(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return $y(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const r=W.fromDate(n);return{timestampValue:tr(s.serializer,r)}}if(n instanceof W){const r=new W(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:tr(s.serializer,r)}}if(n instanceof jr)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof Nt)return{bytesValue:yh(s.serializer,n._byteString)};if(n instanceof ne){const r=s.databaseId,i=n.firestore._databaseId;if(!i.isEqual(r))throw s._a(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${r.projectId}/${r.database}`);return{referenceValue:Bo(n.firestore._databaseId||s.databaseId,n._key.path)}}throw s._a(`Unsupported field value: ${$r(n)}`)}(t,e)}function Yh(t,e){const n={};return zl(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Mt(t,(s,r)=>{const i=gn(r,e.ha(s));i!=null&&(n[s]=i)}),{mapValue:{fields:n}}}function Jh(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof W||t instanceof jr||t instanceof Nt||t instanceof ne||t instanceof pn)}function sa(t,e,n){if(!Jh(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const s=$r(n);throw s==="an object"?e._a(t+" a custom object"):e._a(t+" "+s)}}function Qi(t,e,n){if((e=U(e))instanceof fn)return e._internalPath;if(typeof e=="string")return ra(t,e);throw rr("Field path arguments must be of type string or ",t,!1,void 0,n)}const H_=new RegExp("[~\\*/\\[\\]]");function ra(t,e,n){if(e.search(H_)>=0)throw rr(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new fn(...e.split("."))._internalPath}catch{throw rr(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function rr(t,e,n,s,r){const i=s&&!s.isEmpty(),o=r!==void 0;let a=`Function ${e}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${s}`),o&&(c+=` in document ${r}`),c+=")"),new v(f.INVALID_ARGUMENT,a+t+c)}function Zh(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed{constructor(e,n,s,r,i){this._firestore=e,this._userDataWriter=n,this._key=s,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ne(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new K_(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Hr("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class K_ extends ed{data(){return super.data()}}function Hr(t,e){return typeof e=="string"?ra(t,e):e instanceof fn?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function td(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new v(f.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class ia{}class oa extends ia{}function G_(t,e,...n){let s=[];e instanceof ia&&s.push(e),s=s.concat(n),function(r){const i=r.filter(a=>a instanceof Kr).length,o=r.filter(a=>a instanceof ms).length;if(i>1||i>0&&o>0)throw new v(f.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(s);for(const r of s)t=r._apply(t);return t}class ms extends oa{constructor(e,n,s){super(),this._field=e,this._op=n,this._value=s,this.type="where"}static _create(e,n,s){return new ms(e,n,s)}_apply(e){const n=this._parse(e);return nd(e._query,n),new Je(e.firestore,e.converter,Bi(e._query,n))}_parse(e){const n=ps(e.firestore);return function(r,i,o,a,c,u,l){let h;if(c.isKeyField()){if(u==="array-contains"||u==="array-contains-any")throw new v(f.INVALID_ARGUMENT,`Invalid Query. You can't perform '${u}' queries on documentId().`);if(u==="in"||u==="not-in"){$c(l,u);const d=[];for(const p of l)d.push(Bc(a,r,p));h={arrayValue:{values:d}}}else h=Bc(a,r,l)}else u!=="in"&&u!=="not-in"&&u!=="array-contains-any"||$c(l,u),h=z_(o,i,l,u==="in"||u==="not-in");return G.create(c,u,h)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function W_(t,e,n){const s=e,r=Hr("where",t);return ms._create(r,s,n)}class Kr extends ia{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new Kr(e,n)}_parse(e){const n=this._queryConstraints.map(s=>s._parse(e)).filter(s=>s.getFilters().length>0);return n.length===1?n[0]:Se.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,r){let i=s;const o=r.getFlattenedFilters();for(const a of o)nd(i,a),i=Bi(i,a)}(e._query,n),new Je(e.firestore,e.converter,Bi(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Gr extends oa{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new Gr(e,n)}_apply(e){const n=function(s,r,i){if(s.startAt!==null)throw new v(f.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new v(f.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");const o=new Gt(r,i);return function(a,c){if(Uo(a)===null){const u=Nr(a);u!==null&&sd(a,u,c.field)}}(s,o),o}(e._query,this._field,this._direction);return new Je(e.firestore,e.converter,function(s,r){const i=s.explicitOrderBy.concat([r]);return new un(s.path,s.collectionGroup,i,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function Q_(t,e="asc"){const n=e,s=Hr("orderBy",t);return Gr._create(s,n)}function Bc(t,e,n){if(typeof(n=U(n))=="string"){if(n==="")throw new v(f.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Zl(e)&&n.indexOf("/")!==-1)throw new v(f.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const s=e.path.child(V.fromString(n));if(!T.isDocumentKey(s))throw new v(f.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);return uc(t,new T(s))}if(n instanceof ne)return uc(t,n._key);throw new v(f.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${$r(n)}.`)}function $c(t,e){if(!Array.isArray(t)||t.length===0)throw new v(f.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function nd(t,e){if(e.isInequality()){const s=Nr(t),r=e.field;if(s!==null&&!s.isEqual(r))throw new v(f.INVALID_ARGUMENT,`Invalid query. All where filters with an inequality (<, <=, !=, not-in, >, or >=) must be on the same field. But you have inequality filters on '${s.toString()}' and '${r.toString()}'`);const i=Uo(t);i!==null&&sd(t,r,i)}const n=function(s,r){for(const i of s)for(const o of i.getFlattenedFilters())if(r.indexOf(o.op)>=0)return o.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new v(f.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new v(f.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}function sd(t,e,n){if(!n.isEqual(e))throw new v(f.INVALID_ARGUMENT,`Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field '${e.toString()}' and so you must also use '${e.toString()}' as your first argument to orderBy(), but your first orderBy() is on field '${n.toString()}' instead.`)}class rd{convertValue(e,n="none"){switch(Rt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return K(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(kt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 10:return this.convertObject(e.mapValue,n);default:throw I()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const s={};return Mt(e,(r,i)=>{s[r]=this.convertValue(i,n)}),s}convertGeoPoint(e){return new jr(K(e.latitude),K(e.longitude))}convertArray(e,n){return(e.values||[]).map(s=>this.convertValue(s,n))}convertServerTimestamp(e,n){switch(n){case"previous":const s=Po(e);return s==null?null:this.convertValue(s,n);case"estimate":return this.convertTimestamp(zn(e));default:return null}}convertTimestamp(e){const n=lt(e);return new W(n.seconds,n.nanos)}convertDocumentKey(e,n){const s=V.fromString(e);B(Th(s));const r=new Zt(s.get(1),s.get(3)),i=new T(s.popFirst(5));return r.isEqual(n)||Qe(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aa(t,e,n){let s;return s=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ca extends ed{constructor(e,n,s,r,i,o){super(e,n,s,r,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Nn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const s=this._document.data.field(Hr("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,n.serverTimestamps)}}}class Nn extends ca{data(e={}){return super.data(e)}}class ua{constructor(e,n,s,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new qt(r.hasPendingWrites,r.fromCache),this.query=s}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(s=>{e.call(n,new Nn(this._firestore,this._userDataWriter,s.key,s,new qt(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new v(f.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,r){if(s._snapshot.oldDocs.isEmpty()){let i=0;return s._snapshot.docChanges.map(o=>{const a=new Nn(s._firestore,s._userDataWriter,o.doc.key,o.doc,new qt(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);return o.doc,{type:"added",doc:a,oldIndex:-1,newIndex:i++}})}{let i=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(o=>r||o.type!==3).map(o=>{const a=new Nn(s._firestore,s._userDataWriter,o.doc.key,o.doc,new qt(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);let c=-1,u=-1;return o.type!==0&&(c=i.indexOf(o.doc.key),i=i.delete(o.doc.key)),o.type!==1&&(i=i.add(o.doc),u=i.indexOf(o.doc.key)),{type:X_(o.type),doc:a,oldIndex:c,newIndex:u}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function X_(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return I()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Y_(t){t=ue(t,ne);const e=ue(t.firestore,be);return M_(dn(e),t._key).then(n=>id(e,t,n))}class la extends rd{constructor(e){super(),this.firestore=e}convertBytes(e){return new Nt(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new ne(this.firestore,null,n)}}function J_(t){t=ue(t,Je);const e=ue(t.firestore,be),n=dn(e),s=new la(e);return td(t._query),L_(n,t._query).then(r=>new ua(e,s,t,r))}function Z_(t,e,n){t=ue(t,ne);const s=ue(t.firestore,be),r=aa(t.converter,e,n);return mn(s,[ta(ps(s),"setDoc",t._key,r,t.converter!==null,n).toMutation(t._key,pe.none())])}function ew(t,e,n,...s){t=ue(t,ne);const r=ue(t.firestore,be),i=ps(r);let o;return o=typeof(e=U(e))=="string"||e instanceof fn?Xh(i,"updateDoc",t._key,e,n,s):Qh(i,"updateDoc",t._key,e),mn(r,[o.toMutation(t._key,pe.exists(!0))])}function tw(t){return mn(ue(t.firestore,be),[new Lr(t._key,pe.none())])}function nw(t,e){const n=ue(t.firestore,be),s=Hh(t),r=aa(t.converter,e);return mn(n,[ta(ps(t.firestore),"addDoc",s._key,r,t.converter!==null,{}).toMutation(s._key,pe.exists(!1))]).then(()=>s)}function sw(t,...e){var n,s,r;t=U(t);let i={includeMetadataChanges:!1},o=0;typeof e[o]!="object"||Vc(e[o])||(i=e[o],o++);const a={includeMetadataChanges:i.includeMetadataChanges};if(Vc(e[o])){const h=e[o];e[o]=(n=h.next)===null||n===void 0?void 0:n.bind(h),e[o+1]=(s=h.error)===null||s===void 0?void 0:s.bind(h),e[o+2]=(r=h.complete)===null||r===void 0?void 0:r.bind(h)}let c,u,l;if(t instanceof ne)u=ue(t.firestore,be),l=Rr(t._key.path),c={next:h=>{e[o]&&e[o](id(u,t,h))},error:e[o+1],complete:e[o+2]};else{const h=ue(t,Je);u=ue(h.firestore,be),l=h._query;const d=new la(u);c={next:p=>{e[o]&&e[o](new ua(u,d,h,p))},error:e[o+1],complete:e[o+2]},td(t._query)}return function(h,d,p,y){const w=new ea(y),_=new Jo(d,w,p);return h.asyncQueue.enqueueAndForget(async()=>Qo(await sr(h),_)),()=>{w.Dc(),h.asyncQueue.enqueueAndForget(async()=>Xo(await sr(h),_))}}(dn(u),l,a,c)}function mn(t,e){return function(n,s){const r=new ze;return n.asyncQueue.enqueueAndForget(async()=>w_(await P_(n),s,r)),r.promise}(dn(t),e)}function id(t,e,n){const s=n.docs.get(e._key),r=new la(t);return new ca(t,r,e._key,s,new qt(n.hasPendingWrites,n.fromCache),e.converter)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class od{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=ps(e)}set(e,n,s){this._verifyNotCommitted();const r=fi(e,this._firestore),i=aa(r.converter,n,s),o=ta(this._dataReader,"WriteBatch.set",r._key,i,r.converter!==null,s);return this._mutations.push(o.toMutation(r._key,pe.none())),this}update(e,n,s,...r){this._verifyNotCommitted();const i=fi(e,this._firestore);let o;return o=typeof(n=U(n))=="string"||n instanceof fn?Xh(this._dataReader,"WriteBatch.update",i._key,n,s,r):Qh(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(o.toMutation(i._key,pe.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=fi(e,this._firestore);return this._mutations=this._mutations.concat(new Lr(n._key,pe.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new v(f.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function fi(t,e){if((t=U(t)).firestore!==e)throw new v(f.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rw(){return new gs("deleteField")}function iw(){return new na("serverTimestamp")}function ow(...t){return new j_("arrayUnion",t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aw(t){return dn(t=ue(t,be)),new od(t,e=>mn(t,e))}(function(t,e=!0){(function(n){cn=n})(Ot),St(new ct("firestore",(n,{instanceIdentifier:s,options:r})=>{const i=n.getProvider("app").getImmediate(),o=new be(new ay(n.getProvider("auth-internal")),new hy(n.getProvider("app-check-internal")),function(a,c){if(!Object.prototype.hasOwnProperty.apply(a.options,["projectId"]))throw new v(f.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zt(a.options.projectId,c)}(i,s),i);return r=Object.assign({useFetchStreams:e},r),o._setSettings(r),o},"PUBLIC").setMultipleInstances(!0)),De(rc,"3.13.0",t),De(rc,"3.13.0","esm2017")})();const kE=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:rd,Bytes:Nt,CollectionReference:He,DocumentReference:ne,DocumentSnapshot:ca,FieldPath:fn,FieldValue:pn,Firestore:be,FirestoreError:v,GeoPoint:jr,Query:Je,QueryCompositeFilterConstraint:Kr,QueryConstraint:oa,QueryDocumentSnapshot:Nn,QueryFieldFilterConstraint:ms,QueryOrderByConstraint:Gr,QuerySnapshot:ua,SnapshotMetadata:qt,Timestamp:W,WriteBatch:od,_DatabaseId:Zt,_DocumentKey:T,_EmptyAuthCredentialsProvider:ql,_FieldPath:ee,_TestingHooks:xr,_cast:ue,_logWarn:Ct,_validateIsNotUsedTogether:jh,addDoc:nw,arrayUnion:ow,collection:x_,connectFirestoreEmulator:zh,deleteDoc:tw,deleteField:rw,doc:Hh,ensureFirestoreConfigured:dn,executeWrite:mn,getDoc:Y_,getDocs:J_,getFirestore:F_,onSnapshot:sw,orderBy:Q_,query:G_,serverTimestamp:iw,setDoc:Z_,updateDoc:ew,where:W_,writeBatch:aw},Symbol.toStringTag,{value:"Module"}));var cw="firebase",uw="9.23.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */De(cw,uw,"app");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ad="firebasestorage.googleapis.com",cd="storageBucket",lw=120*1e3,hw=600*1e3,dw=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j extends Ue{constructor(e,n,s=0){super(pi(e),`Firebase Storage: ${n} (${pi(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,j.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return pi(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var $;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})($||($={}));function pi(t){return"storage/"+t}function ha(){const t="An unknown error occurred, please check the error payload for server response.";return new j($.UNKNOWN,t)}function fw(t){return new j($.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function pw(t){return new j($.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function gw(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new j($.UNAUTHENTICATED,t)}function mw(){return new j($.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function yw(t){return new j($.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function ud(){return new j($.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function ld(){return new j($.CANCELED,"User canceled the upload/download.")}function vw(t){return new j($.INVALID_URL,"Invalid URL '"+t+"'.")}function _w(t){return new j($.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function ww(){return new j($.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+cd+"' property when initializing the app?")}function hd(){return new j($.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Ew(){return new j($.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function Tw(){return new j($.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Iw(t){return new j($.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Xi(t){return new j($.INVALID_ARGUMENT,t)}function dd(){return new j($.APP_DELETED,"The Firebase app was deleted.")}function Sw(t){return new j($.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Dn(t,e){return new j($.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function wn(t){throw new j($.INTERNAL_ERROR,"Internal error: "+t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let s;try{s=we.makeFromUrl(e,n)}catch{return new we(e,"")}if(s.path==="")return s;throw _w(e)}static makeFromUrl(e,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function i(M){M.path.charAt(M.path.length-1)==="/"&&(M.path_=M.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+r+o,"i"),c={bucket:1,path:3};function u(M){M.path_=decodeURIComponent(M.path)}const l="v[A-Za-z0-9_]+",h=n.replace(/[.]/g,"\\."),d="(/([^?#]*).*)?$",p=new RegExp(`^https?://${h}/${l}/b/${r}/o${d}`,"i"),y={bucket:1,path:3},w=n===ad?"(?:storage.googleapis.com|storage.cloud.google.com)":n,_="([^?#]*)",O=new RegExp(`^https?://${w}/${r}/${_}`,"i"),R=[{regex:a,indices:c,postModify:i},{regex:p,indices:y,postModify:u},{regex:O,indices:{bucket:1,path:2},postModify:u}];for(let M=0;M<R.length;M++){const ge=R[M],me=ge.regex.exec(e);if(me){const Fe=me[ge.indices.bucket];let Ve=me[ge.indices.path];Ve||(Ve=""),s=new we(Fe,Ve),ge.postModify(s);break}}if(s==null)throw vw(e);return s}}class bw{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Aw(t,e,n){let s=1,r=null,i=null,o=!1,a=0;function c(){return a===2}let u=!1;function l(..._){u||(u=!0,e.apply(null,_))}function h(_){r=setTimeout(()=>{r=null,t(p,c())},_)}function d(){i&&clearTimeout(i)}function p(_,...O){if(u){d();return}if(_){d(),l.call(null,_,...O);return}if(c()||o){d(),l.call(null,_,...O);return}s<64&&(s*=2);let R;a===1?(a=2,R=0):R=(s+Math.random())*1e3,h(R)}let y=!1;function w(_){y||(y=!0,d(),!u&&(r!==null?(_||(a=2),clearTimeout(r),h(0)):_||(a=1)))}return h(0),i=setTimeout(()=>{o=!0,w(!0)},n),w}function Cw(t){t(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kw(t){return t!==void 0}function Rw(t){return typeof t=="function"}function Nw(t){return typeof t=="object"&&!Array.isArray(t)}function Wr(t){return typeof t=="string"||t instanceof String}function qc(t){return da()&&t instanceof Blob}function da(){return typeof Blob<"u"&&!xd()}function jc(t,e,n,s){if(s<e)throw Xi(`Invalid value for '${t}'. Expected ${e} or greater.`);if(s>n)throw Xi(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yn(t,e,n){let s=e;return n==null&&(s=`https://${e}`),`${n}://${s}/v0${t}`}function fd(t){const e=encodeURIComponent;let n="?";for(const s in t)if(t.hasOwnProperty(s)){const r=e(s)+"="+e(t[s]);n=n+r+"&"}return n=n.slice(0,-1),n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Tt;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Tt||(Tt={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pd(t,e){const n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,i=e.indexOf(t)!==-1;return n||r||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dw{constructor(e,n,s,r,i,o,a,c,u,l,h,d=!0){this.url_=e,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=c,this.timeout_=u,this.progressCallback_=l,this.connectionFactory_=h,this.retry=d,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((p,y)=>{this.resolve_=p,this.reject_=y,this.start_()})}start_(){const e=(s,r)=>{if(r){s(!1,new ks(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=a=>{const c=a.loaded,u=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,u)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const a=i.getErrorCode()===Tt.NO_ERROR,c=i.getStatus();if(!a||pd(c,this.additionalRetryCodes_)&&this.retry){const l=i.getErrorCode()===Tt.ABORT;s(!1,new ks(!1,null,l));return}const u=this.successCodes_.indexOf(c)!==-1;s(!0,new ks(u,i))})},n=(s,r)=>{const i=this.resolve_,o=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());kw(c)?i(c):i()}catch(c){o(c)}else if(a!==null){const c=ha();c.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,c)):o(c)}else if(r.canceled){const c=this.appDelete_?dd():ld();o(c)}else{const c=ud();o(c)}};this.canceled_?n(!1,new ks(!1,null,!0)):this.backoffId_=Aw(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Cw(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class ks{constructor(e,n,s){this.wasSuccessCode=e,this.connection=n,this.canceled=!!s}}function Ow(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function Pw(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Mw(t,e){e&&(t["X-Firebase-GMPID"]=e)}function Lw(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function xw(t,e,n,s,r,i,o=!0){const a=fd(t.urlParams),c=t.url+a,u=Object.assign({},t.headers);return Mw(u,e),Ow(u,n),Pw(u,i),Lw(u,s),new Dw(c,t.method,u,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uw(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Fw(...t){const e=Uw();if(e!==void 0){const n=new e;for(let s=0;s<t.length;s++)n.append(t[s]);return n.getBlob()}else{if(da())return new Blob(t);throw new j($.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Vw(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bw(t){if(typeof atob>"u")throw Iw("base-64");return atob(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ne={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class gi{constructor(e,n){this.data=e,this.contentType=n||null}}function $w(t,e){switch(t){case Ne.RAW:return new gi(gd(e));case Ne.BASE64:case Ne.BASE64URL:return new gi(md(t,e));case Ne.DATA_URL:return new gi(jw(e),zw(e))}throw ha()}function gd(t){const e=[];for(let n=0;n<t.length;n++){let s=t.charCodeAt(n);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const i=s,o=t.charCodeAt(++n);s=65536|(i&1023)<<10|o&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function qw(t){let e;try{e=decodeURIComponent(t)}catch{throw Dn(Ne.DATA_URL,"Malformed data URL.")}return gd(e)}function md(t,e){switch(t){case Ne.BASE64:{const r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw Dn(t,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case Ne.BASE64URL:{const r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw Dn(t,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Bw(e)}catch(r){throw r.message.includes("polyfill")?r:Dn(t,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class yd{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw Dn(Ne.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=Hw(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function jw(t){const e=new yd(t);return e.base64?md(Ne.BASE64,e.rest):qw(e.rest)}function zw(t){return new yd(t).contentType}function Hw(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(e,n){let s=0,r="";qc(e)?(this.data_=e,s=e.size,r=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,n){if(qc(this.data_)){const s=this.data_,r=Vw(s,e,n);return r===null?null:new Be(r)}else{const s=new Uint8Array(this.data_.buffer,e,n-e);return new Be(s,!0)}}static getBlob(...e){if(da()){const n=e.map(s=>s instanceof Be?s.data_:s);return new Be(Fw.apply(null,n))}else{const n=e.map(o=>Wr(o)?$w(Ne.RAW,o).data:o.data_);let s=0;n.forEach(o=>{s+=o.byteLength});const r=new Uint8Array(s);let i=0;return n.forEach(o=>{for(let a=0;a<o.length;a++)r[i++]=o[a]}),new Be(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vd(t){let e;try{e=JSON.parse(t)}catch{return null}return Nw(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kw(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function Gw(t,e){const n=e.split("/").filter(s=>s.length>0).join("/");return t.length===0?n:t+"/"+n}function _d(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ww(t,e){return e}class de{constructor(e,n,s,r){this.server=e,this.local=n||e,this.writable=!!s,this.xform=r||Ww}}let Rs=null;function Qw(t){return!Wr(t)||t.length<2?t:_d(t)}function fa(){if(Rs)return Rs;const t=[];t.push(new de("bucket")),t.push(new de("generation")),t.push(new de("metageneration")),t.push(new de("name","fullPath",!0));function e(i,o){return Qw(o)}const n=new de("name");n.xform=e,t.push(n);function s(i,o){return o!==void 0?Number(o):o}const r=new de("size");return r.xform=s,t.push(r),t.push(new de("timeCreated")),t.push(new de("updated")),t.push(new de("md5Hash",null,!0)),t.push(new de("cacheControl",null,!0)),t.push(new de("contentDisposition",null,!0)),t.push(new de("contentEncoding",null,!0)),t.push(new de("contentLanguage",null,!0)),t.push(new de("contentType",null,!0)),t.push(new de("metadata","customMetadata",!0)),Rs=t,Rs}function Xw(t,e){function n(){const s=t.bucket,r=t.fullPath,i=new we(s,r);return e._makeStorageReference(i)}Object.defineProperty(t,"ref",{get:n})}function Yw(t,e,n){const s={};s.type="file";const r=n.length;for(let i=0;i<r;i++){const o=n[i];s[o.local]=o.xform(s,e[o.server])}return Xw(s,t),s}function wd(t,e,n){const s=vd(e);return s===null?null:Yw(t,s,n)}function Jw(t,e,n,s){const r=vd(e);if(r===null||!Wr(r.downloadTokens))return null;const i=r.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(u=>{const l=t.bucket,h=t.fullPath,d="/b/"+o(l)+"/o/"+o(h),p=yn(d,n,s),y=fd({alt:"media",token:u});return p+y})[0]}function Ed(t,e){const n={},s=e.length;for(let r=0;r<s;r++){const i=e[r];i.writable&&(n[i.server]=t[i.local])}return JSON.stringify(n)}class xt{constructor(e,n,s,r){this.url=e,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ke(t){if(!t)throw ha()}function pa(t,e){function n(s,r){const i=wd(t,r,e);return Ke(i!==null),i}return n}function Zw(t,e){function n(s,r){const i=wd(t,r,e);return Ke(i!==null),Jw(i,r,t.host,t._protocol)}return n}function ys(t){function e(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=mw():r=gw():n.getStatus()===402?r=pw(t.bucket):n.getStatus()===403?r=yw(t.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return e}function ga(t){const e=ys(t);function n(s,r){let i=e(s,r);return s.getStatus()===404&&(i=fw(t.path)),i.serverResponse=r.serverResponse,i}return n}function eE(t,e,n){const s=e.fullServerUrl(),r=yn(s,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,a=new xt(r,i,pa(t,n),o);return a.errorHandler=ga(e),a}function tE(t,e,n){const s=e.fullServerUrl(),r=yn(s,t.host,t._protocol),i="GET",o=t.maxOperationRetryTime,a=new xt(r,i,Zw(t,n),o);return a.errorHandler=ga(e),a}function nE(t,e){const n=e.fullServerUrl(),s=yn(n,t.host,t._protocol),r="DELETE",i=t.maxOperationRetryTime;function o(c,u){}const a=new xt(s,r,o,i);return a.successCodes=[200,204],a.errorHandler=ga(e),a}function sE(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function Td(t,e,n){const s=Object.assign({},n);return s.fullPath=t.path,s.size=e.size(),s.contentType||(s.contentType=sE(null,e)),s}function Id(t,e,n,s,r){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let R="";for(let M=0;M<2;M++)R=R+Math.random().toString().slice(2);return R}const c=a();o["Content-Type"]="multipart/related; boundary="+c;const u=Td(e,s,r),l=Ed(u,n),h="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+l+`\r
--`+c+`\r
Content-Type: `+u.contentType+`\r
\r
`,d=`\r
--`+c+"--",p=Be.getBlob(h,s,d);if(p===null)throw hd();const y={name:u.fullPath},w=yn(i,t.host,t._protocol),_="POST",O=t.maxUploadRetryTime,P=new xt(w,_,pa(t,n),O);return P.urlParams=y,P.headers=o,P.body=p.uploadData(),P.errorHandler=ys(e),P}class ir{constructor(e,n,s,r){this.current=e,this.total=n,this.finalized=!!s,this.metadata=r||null}}function ma(t,e){let n=null;try{n=t.getResponseHeader("X-Goog-Upload-Status")}catch{Ke(!1)}return Ke(!!n&&(e||["active"]).indexOf(n)!==-1),n}function rE(t,e,n,s,r){const i=e.bucketOnlyServerUrl(),o=Td(e,s,r),a={name:o.fullPath},c=yn(i,t.host,t._protocol),u="POST",l={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${s.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},h=Ed(o,n),d=t.maxUploadRetryTime;function p(w){ma(w);let _;try{_=w.getResponseHeader("X-Goog-Upload-URL")}catch{Ke(!1)}return Ke(Wr(_)),_}const y=new xt(c,u,p,d);return y.urlParams=a,y.headers=l,y.body=h,y.errorHandler=ys(e),y}function iE(t,e,n,s){const r={"X-Goog-Upload-Command":"query"};function i(u){const l=ma(u,["active","final"]);let h=null;try{h=u.getResponseHeader("X-Goog-Upload-Size-Received")}catch{Ke(!1)}h||Ke(!1);const d=Number(h);return Ke(!isNaN(d)),new ir(d,s.size(),l==="final")}const o="POST",a=t.maxUploadRetryTime,c=new xt(n,o,i,a);return c.headers=r,c.errorHandler=ys(e),c}const zc=256*1024;function oE(t,e,n,s,r,i,o,a){const c=new ir(0,0);if(o?(c.current=o.current,c.total=o.total):(c.current=0,c.total=s.size()),s.size()!==c.total)throw Ew();const u=c.total-c.current;let l=u;r>0&&(l=Math.min(l,r));const h=c.current,d=h+l;let p="";l===0?p="finalize":u===l?p="upload, finalize":p="upload";const y={"X-Goog-Upload-Command":p,"X-Goog-Upload-Offset":`${c.current}`},w=s.slice(h,d);if(w===null)throw hd();function _(M,ge){const me=ma(M,["active","final"]),Fe=c.current+l,Ve=s.size();let Ae;return me==="final"?Ae=pa(e,i)(M,ge):Ae=null,new ir(Fe,Ve,me==="final",Ae)}const O="POST",P=e.maxUploadRetryTime,R=new xt(n,O,_,P);return R.headers=y,R.body=w.uploadData(),R.progressCallback=a||null,R.errorHandler=ys(t),R}const ye={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function mi(t){switch(t){case"running":case"pausing":case"canceling":return ye.RUNNING;case"paused":return ye.PAUSED;case"success":return ye.SUCCESS;case"canceled":return ye.CANCELED;case"error":return ye.ERROR;default:return ye.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aE{constructor(e,n,s){if(Rw(e)||n!=null||s!=null)this.next=e,this.error=n??void 0,this.complete=s??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ft(t){return(...e)=>{Promise.resolve().then(()=>t(...e))}}class cE{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Tt.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Tt.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Tt.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,s,r){if(this.sent_)throw wn("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(n,e,!0),r!==void 0)for(const i in r)r.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,r[i].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw wn("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw wn("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw wn("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw wn("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class uE extends cE{initXhr(){this.xhr_.responseType="text"}}function rt(){return new uE}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lE{constructor(e,n,s=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=n,this._metadata=s,this._mappings=fa(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=r=>{if(this._request=void 0,this._chunkMultiplier=1,r._codeEquals($.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(pd(r.status,[]))if(i)r=ud();else{this.sleepTime=Math.max(this.sleepTime*2,dw),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=r,this._transition("error")}},this._metadataErrorHandler=r=>{this._request=void 0,r._codeEquals($.CANCELED)?this.completeTransitions_():(this._error=r,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((r,i)=>{this._resolve=r,this._reject=i,this._start()}),this._promise.then(null,()=>{})}isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}_makeProgressCallback(){const e=this._transferred;return n=>this._updateProgress(e+n)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([n,s])=>{switch(this._state){case"running":e(n,s);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,n)=>{const s=rE(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,rt,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((n,s)=>{const r=iE(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(r,rt,n,s);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=zc*this._chunkMultiplier,n=new ir(this._transferred,this._blob.size()),s=this._uploadUrl;this._resolveToken((r,i)=>{let o;try{o=oE(this._ref._location,this._ref.storage,s,this._blob,e,this._mappings,n,this._makeProgressCallback())}catch(c){this._error=c,this._transition("error");return}const a=this._ref.storage._makeRequest(o,rt,r,i,!1);this._request=a,a.getPromise().then(c=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(c.current),c.finalized?(this._metadata=c.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){zc*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,n)=>{const s=eE(this._ref.storage,this._ref._location,this._mappings),r=this._ref.storage._makeRequest(s,rt,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,n)=>{const s=Id(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),r=this._ref.storage._makeRequest(s,rt,e,n);this._request=r,r.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const n=this._transferred;this._transferred=e,this._transferred!==n&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const n=this._state==="paused";this._state=e,n&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=ld(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=mi(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,n,s,r){const i=new aE(n||void 0,s||void 0,r||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,n){return this._promise.then(e,n)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const n=this._observers.indexOf(e);n!==-1&&this._observers.splice(n,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(n=>{this._notifyObserver(n)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(mi(this._state)){case ye.SUCCESS:Ft(this._resolve.bind(null,this.snapshot))();break;case ye.CANCELED:case ye.ERROR:const n=this._reject;Ft(n.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(mi(this._state)){case ye.RUNNING:case ye.PAUSED:e.next&&Ft(e.next.bind(e,this.snapshot))();break;case ye.SUCCESS:e.complete&&Ft(e.complete.bind(e))();break;case ye.CANCELED:case ye.ERROR:e.error&&Ft(e.error.bind(e,this._error))();break;default:e.error&&Ft(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e,n){this._service=e,n instanceof we?this._location=n:this._location=we.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new Dt(e,n)}get root(){const e=new we(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return _d(this._location.path)}get storage(){return this._service}get parent(){const e=Kw(this._location.path);if(e===null)return null;const n=new we(this._location.bucket,e);return new Dt(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw Sw(e)}}function hE(t,e,n){t._throwIfRoot("uploadBytes");const s=Id(t.storage,t._location,fa(),new Be(e,!0),n);return t.storage.makeRequestWithTokens(s,rt).then(r=>({metadata:r,ref:t}))}function dE(t,e,n){return t._throwIfRoot("uploadBytesResumable"),new lE(t,new Be(e),n)}function fE(t){t._throwIfRoot("getDownloadURL");const e=tE(t.storage,t._location,fa());return t.storage.makeRequestWithTokens(e,rt).then(n=>{if(n===null)throw Tw();return n})}function pE(t){t._throwIfRoot("deleteObject");const e=nE(t.storage,t._location);return t.storage.makeRequestWithTokens(e,rt)}function gE(t,e){const n=Gw(t._location.path,e),s=new we(t._location.bucket,n);return new Dt(t.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mE(t){return/^[A-Za-z]+:\/\//.test(t)}function yE(t,e){return new Dt(t,e)}function Sd(t,e){if(t instanceof ya){const n=t;if(n._bucket==null)throw ww();const s=new Dt(n,n._bucket);return e!=null?Sd(s,e):s}else return e!==void 0?gE(t,e):t}function vE(t,e){if(e&&mE(e)){if(t instanceof ya)return yE(t,e);throw Xi("To use ref(service, url), the first argument must be a Storage instance.")}else return Sd(t,e)}function Hc(t,e){const n=e==null?void 0:e[cd];return n==null?null:we.makeFromBucketSpec(n,t)}function _E(t,e,n,s={}){t.host=`${e}:${n}`,t._protocol="http";const{mockUserToken:r}=s;r&&(t._overrideAuthToken=typeof r=="string"?r:tu(r,t.app.options.projectId))}class ya{constructor(e,n,s,r,i){this.app=e,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=i,this._bucket=null,this._host=ad,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=lw,this._maxUploadRetryTime=hw,this._requests=new Set,r!=null?this._bucket=we.makeFromBucketSpec(r,this._host):this._bucket=Hc(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=we.makeFromBucketSpec(this._url,e):this._bucket=Hc(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){jc("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){jc("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Dt(this,e)}_makeRequest(e,n,s,r,i=!0){if(this._deleted)return new bw(dd());{const o=xw(e,this._appId,s,r,n,this._firebaseVersion,i);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,s,r).getPromise()}}const Kc="@firebase/storage",Gc="0.11.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bd="storage";function RE(t,e,n){return t=U(t),hE(t,e,n)}function NE(t,e,n){return t=U(t),dE(t,e,n)}function DE(t){return t=U(t),fE(t)}function OE(t){return t=U(t),pE(t)}function PE(t,e){return t=U(t),vE(t,e)}function ME(t=Zi(),e){t=U(t);const s=ar(t,bd).getImmediate({identifier:e}),r=Jc("storage");return r&&wE(s,...r),s}function wE(t,e,n,s={}){_E(t,e,n,s)}function EE(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),s=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new ya(n,s,r,e,Ot)}function TE(){St(new ct(bd,EE,"PUBLIC").setMultipleInstances(!0)),De(Kc,Gc,""),De(Kc,Gc,"esm2017")}TE();export{tt as G,sw as I,rw as K,F_ as P,ow as Q,G_ as R,aw as W,x_ as _,Ou as a,Gp as b,AE as c,bE as d,Hh as e,Y_ as f,CE as g,iw as h,ew as i,Kf as j,ME as k,DE as l,Z_ as m,W as n,SE as o,nw as p,J_ as q,PE as r,IE as s,W_ as t,RE as u,OE as v,NE as w,Q_ as x,tw as y,kE as z};
