(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`modulepreload`,t=function(e){return`/CoordiMath/`+e},n={},r=function(r,i,a){let o=Promise.resolve();if(i&&i.length>0){let r=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function u(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,new URL(`../../../src/node/plugins/importAnalysisBuild.ts`,import.meta.url)).href}o=l(i.map(i=>{if(i=t(i,a),i=u(i),i in n)return;n[i]=!0;let o=i.endsWith(`.css`);for(let e=r.length-1;e>=0;e--){let t=r[e];if(t.href===i&&(!o||t.rel===`stylesheet`))return}let s=document.createElement(`link`);if(s.rel=o?`stylesheet`:e,o||(s.as=`script`),s.crossOrigin=``,s.href=i,c&&s.setAttribute(`nonce`,c),document.head.appendChild(s),o)return new Promise((e,t)=>{s.addEventListener(`load`,e),s.addEventListener(`error`,()=>t(Error(`Unable to preload CSS for ${i}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(e=>{for(let t of e||[])t.status===`rejected`&&s(t.reason);return r().catch(s)})},i=`[playabl/sdk]`,a=`playabl.ai`,o=`/Runtime-Script/sdk/v1/version.json`,s=/\.(dev|staging)\.playabl\.ai$/,c=`https://cdn.playabl.ai/Runtime-Script/sdk/v1/runtime.js`;function l(e){return e===`local`||e===`dev`||e===`staging`||e===`prod`}function u(e=typeof window<`u`?window.location.hostname:``,t=typeof window<`u`?window.location.search:``){let n=new URLSearchParams(t).get(`env`);if(l(n))return n;if(e===`localhost`||e===`127.0.0.1`)return`local`;let r=e.match(s);return r?r[1]:`prod`}function d(e){return`https://${e===`prod`?`cdn`:`cdn-${e}`}.${a}${o}`}async function f(e={}){if(e.runtimeUrl)return e.runtimeUrl;let t=u();if(!e.manifestUrl&&t===`local`)return c;let n=e.manifestUrl??d(t);try{let e=await fetch(n,{cache:`no-store`});if(!e.ok)throw Error(`manifest HTTP ${e.status}`);let t=await e.json();if(typeof t.runtimeUrl!=`string`||!t.runtimeUrl)throw Error(`manifest missing runtimeUrl`);return t.runtimeUrl}catch(e){return console.warn(`${i} runtime manifest unavailable; using fallback runtime URL`,e),c}}var p=class extends Error{code;cause;constructor(e,t,n){super(t??e),this.name=`PlayablError`,this.code=e,this.cause=n}},m,h,g,_,ee=async()=>{let e=await f({runtimeUrl:m,manifestUrl:h});return(await r(()=>import(e),[])).default};async function v(){if(typeof window>`u`)throw new p(`SDK_NOT_READY`,`Playabl SDK runtime can only be loaded in a browser.`);return g??=ee().then(e=>(_=e,e),e=>{throw g=void 0,new p(`SDK_NOT_READY`,`Playabl SDK runtime could not be loaded.`,e)}),g}function y(){return _}var b={ready:async()=>(await v()).ready(),leaderboard:{submit:async e=>(await v()).leaderboard.submit(e)},gameState:{save:async e=>(await v()).gameState.save(e),load:async()=>(await v()).gameState.load(),clear:async()=>(await v()).gameState.clear()},tweaks:{init:async e=>(await v()).tweaks.init(e)},assets:{register:async e=>(await v()).assets.register(e)},device:{haptics:{isSupported:()=>{let e=y();return e?e.device.haptics.isSupported():!1},vibrate:async e=>(await v()).device.haptics.vibrate(e),cancel:async()=>(await v()).device.haptics.cancel()},camera:{isSupported:()=>{let e=y();return e?e.device.camera.isSupported():!1},getStream:async e=>(await v()).device.camera.getStream(e),capturePhoto:async e=>(await v()).device.camera.capturePhoto(e),stopStream:()=>{let e=y();e&&e.device.camera.stopStream()}},microphone:{isSupported:()=>{let e=y();return e?e.device.microphone.isSupported():!1},getStream:async e=>(await v()).device.microphone.getStream(e),startRecording:e=>{let t=y();if(!t)throw Error(`Playabl runtime not ready; call sdk.ready() before startRecording()`);t.device.microphone.startRecording(e)},stopRecording:async()=>(await v()).device.microphone.stopRecording(),stopStream:()=>{let e=y();e&&e.device.microphone.stopStream()}},geolocation:{isSupported:()=>{let e=y();return e?e.device.geolocation.isSupported():!1},getCurrentPosition:async e=>(await v()).device.geolocation.getCurrentPosition(e),watchPosition:(e,t)=>{let n=null,r=!1;return v().then(i=>{r||(n=i.device.geolocation.watchPosition(e,t))}),()=>{r=!0,n&&n()}}},fileSystem:{isSupported:()=>{let e=y();return e?e.device.fileSystem.isSupported():!1},isLegacySupported:()=>{let e=y();return e?e.device.fileSystem.isLegacySupported():!1},openFile:async e=>(await v()).device.fileSystem.openFile(e),saveFile:async(e,t)=>(await v()).device.fileSystem.saveFile(e,t),readAsText:async e=>(await v()).device.fileSystem.readAsText(e),readAsDataURL:async e=>(await v()).device.fileSystem.readAsDataURL(e)},sensors:{isMotionSupported:()=>{let e=y();return e?e.device.sensors.isMotionSupported():!1},isOrientationSupported:()=>{let e=y();return e?e.device.sensors.isOrientationSupported():!1},requestMotionPermission:async()=>(await v()).device.sensors.requestMotionPermission(),watchMotion:(e,t)=>{let n=null,r=!1;return v().then(i=>{r||(n=i.device.sensors.watchMotion(e,t))}),()=>{r=!0,n&&n()}},watchOrientation:e=>{let t=null,n=!1;return v().then(r=>{n||(t=r.device.sensors.watchOrientation(e))}),()=>{n=!0,t&&t()}}}},audio:{isSupported:()=>{let e=y();return e?e.audio.isSupported():!1},getContext:async e=>(await v()).audio.getContext(e),createContext:async e=>(await v()).audio.createContext(e)}},x=Object.freeze({start:-16,end:16,leftClosed:!0,rightClosed:!0});function S(e,t,n,r){return{start:Number(e),end:Number(t),leftClosed:!!n,rightClosed:!!r}}function te(e,t){if(t.empty)return``;let n=Number(t.start),r=Number(t.end);return!Number.isFinite(n)||!Number.isFinite(r)?`El conjunto ${e} debe tener extremos numéricos.`:n<x.start||r>x.end?`El conjunto ${e} debe estar dentro del rango de −16 a +16.`:n>=r?`El extremo izquierdo del intervalo debe ser menor que el derecho.`:``}function C(e){return e.empty?[]:[S(e.start,e.end,e.leftClosed,e.rightClosed)]}function ne(e){let t=e.leftClosed?`[`:`(`,n=e.rightClosed?`]`:`)`;return`${t}${T(e.start)}, ${T(e.end)}${n}`}function w(e){let t=E(e);return t.length===0?`∅`:t.map(ne).join(` ∪ `)}function T(e){return String(Number.isInteger(e)?e:Number(e.toFixed(2)))}function E(e){let t=e.map(e=>se(e)).filter(e=>e&&!R(e)).sort((e,t)=>e.start-t.start||Number(t.leftClosed)-Number(e.leftClosed)),n=[];for(let e of t){let t=n[n.length-1];if(!t){n.push({...e});continue}let r=e.start<t.end,i=e.start===t.end&&(t.rightClosed||e.leftClosed);r||i?e.end>t.end?(t.end=e.end,t.rightClosed=e.rightClosed):e.end===t.end&&(t.rightClosed=t.rightClosed||e.rightClosed):n.push({...e})}return n}function D(e,t){return E([...e,...t])}function O(e,t){let n=[];for(let r of E(e))for(let e of E(t)){let t=Math.max(r.start,e.start),i=Math.min(r.end,e.end),a=S(t,i,z(r,t)&&z(e,t),z(r,i)&&z(e,i));R(a)||n.push(a)}return E(n)}function k(e,t){return O(e,A(t))}function re(e,t){return D(k(e,t),k(t,e))}function A(e){let t=E(e);if(t.length===0)return[x];let n=[],r=x.start,i=!0;for(let e of t){let t=S(r,e.start,i,!e.leftClosed);R(t)||n.push(t),r=e.end,i=!e.rightClosed}let a=S(r,x.end,i,!0);return R(a)||n.push(a),E(n)}function j(e,t){let n=Object.entries(t).map(([e,t])=>te(e,t)).find(Boolean);if(n)return{ok:!1,error:n};let r=L(e);if(r.error)return{ok:!1,error:r.error};if(r.items.length===0)return{ok:!1,error:`Construye una expresión antes de resolver.`};let i=ae(r.items),a=i.parseExpression();if(a.error)return{ok:!1,error:a.error};if(!i.isAtEnd())return{ok:!1,error:`La expresión contiene símbolos en una posición inválida.`};let o=[...new Set(r.items.filter(e=>[`A`,`B`,`C`].includes(e)))],s=[{operation:`Validación inicial`,detail:`Se revisan extremos, símbolos permitidos, operadores y paréntesis balanceados.`,result:`La expresión es válida para resolverse.`},{operation:`Conjuntos de partida`,detail:o.length>0?o.map(e=>`${e} = ${w(C(t[e]))}`).join(`; `):`No hay conjuntos usados.`,result:`Estos intervalos son la base del cálculo.`},{operation:`Orden de resolución`,detail:`Primero se resuelven paréntesis y complementos; después ∩; finalmente ∪, − y △ de izquierda a derecha.`,result:e}];return{ok:!0,result:E(M(a.node,t,s)),steps:s,interpretation:oe(a.node)}}function ie(e,t){let n=e.replaceAll(` `,``),r=n.at(-1)||``,i=e=>[`A`,`B`,`C`].includes(e),a=e=>[`∪`,`∩`,`−`,`△`].includes(e);return t===`clear`||t===`back`?!0:i(t)?!r||a(r)||r===`(`:a(t)||t===`'`?i(r)||r===`)`||r===`'`:t===`(`?!r||a(r)||r===`(`:t===`)`?[...n].reduce((e,t)=>e+(t===`(`?1:t===`)`?-1:0),0)>0&&(i(r)||r===`)`||r===`'`):!1}function ae(e){let t=0,n=()=>e[t],r=()=>e[t++],i=()=>t>=e.length;function a(){return o()}function o(){let e=s();if(e.error)return e;for(;[`∪`,`−`,`△`].includes(n());){let t=r(),n=s();if(n.error)return n;e={node:{type:`binary`,operator:t,left:e.node,right:n.node}}}return e}function s(){let e=c();if(e.error)return e;for(;n()===`∩`;){let t=r(),n=c();if(n.error)return n;e={node:{type:`binary`,operator:t,left:e.node,right:n.node}}}return e}function c(){let e=l();if(e.error)return e;for(;n()===`'`;)r(),e={node:{type:`complement`,value:e.node}};return e}function l(){let e=r();if([`A`,`B`,`C`].includes(e))return{node:{type:`set`,name:e}};if(e===`(`){let e=a();return e.error?e:n()===`)`?(r(),e):{error:`La expresión contiene un paréntesis sin cerrar.`}}return e?{error:`El símbolo “${e}” no puede aparecer en esa posición.`}:{error:`La expresión está incompleta.`}}return{parseExpression:a,isAtEnd:i}}function M(e,t,n){if(e.type===`set`)return C(t[e.name]);if(e.type===`complement`){let r=M(e.value,t,n),i=A(r);return n.push({operation:`Complemento`,detail:`Se toma el universo [−16, 16] y se elimina ${w(r)}.`,result:w(i)}),i}let r=M(e.left,t,n),i=M(e.right,t,n),a=N(e.operator,r,i);return n.push({operation:P(e.operator),detail:F(e.operator,r,i),result:w(a)}),a}function N(e,t,n){return e===`∪`?D(t,n):e===`∩`?O(t,n):e===`−`?k(t,n):re(t,n)}function P(e){return{"∪":`Unión`,"∩":`Intersección`,"−":`Diferencia`,"△":`Diferencia simétrica`}[e]||`Operación`}function F(e,t,n){let r=w(t),i=w(n);return e===`∪`?`Se juntan todas las regiones de ${r} y ${i}.`:e===`∩`?`Se conserva solo la zona que aparece al mismo tiempo en ${r} y ${i}.`:e===`−`?`Se parte de ${r} y se recorta todo lo que coincida con ${i}.`:`Se combinan ${r} y ${i}, eliminando la zona común para dejar solo las partes exclusivas.`}function oe(e){if(e.type===`set`)return`Se utiliza el conjunto ${e.name}.`;if(e.type===`complement`)return`Se toma todo lo que pertenece al universo de −16 a +16 y se excluye el resultado de: ${I(e.value)}.`;let t=I(e.left),n=I(e.right);return{"∪":`Se calcula la unión: se conservan los elementos que pertenecen a ${t}, a ${n} o a ambos.`,"∩":`Se calcula la intersección: se conservan únicamente los elementos comunes entre ${t} y ${n}.`,"−":`Se calcula la diferencia: se parte de ${t} y se eliminan los elementos que también pertenecen a ${n}.`,"△":`Se calcula la diferencia simétrica: se conservan los elementos que están en ${t} o en ${n}, pero no en ambos a la vez.`}[e.operator]}function I(e){return e.type===`set`?`el conjunto ${e.name}`:e.type===`complement`?`el complemento de (${I(e.value)})`:`la ${{"∪":`unión`,"∩":`intersección`,"−":`diferencia`,"△":`diferencia simétrica`}[e.operator]} entre (${I(e.left)}) y (${I(e.right)})`}function L(e){let t=new Set([`A`,`B`,`C`,`∪`,`∩`,`−`,`△`,`'`,`(`,`)`]),n=[];for(let r of e.replaceAll(` `,``)){let e=r===`-`?`−`:r;if(!t.has(e))return{error:`El símbolo “${r}” no está permitido.`};n.push(e)}return n.reduce((e,t)=>e+(t===`(`?1:t===`)`?-1:0),0)===0?{items:n}:{error:`La expresión contiene un paréntesis sin cerrar.`}}function se(e){let t=Math.max(x.start,Number(e.start)),n=Math.min(x.end,Number(e.end));return!Number.isFinite(t)||!Number.isFinite(n)?null:S(t,n,t===e.start?e.leftClosed:!0,n===e.end?e.rightClosed:!0)}function R(e){return e.start>e.end?!0:e.start===e.end?!(e.leftClosed&&e.rightClosed):!1}function z(e,t){let n=t>e.start||t===e.start&&e.leftClosed,r=t<e.end||t===e.end&&e.rightClosed;return n&&r}var B=16;function ce(e,t,n){return{id:e,x:V(t),y:V(n),color:ye(e)}}function V(e){let t=Number(e);return Number.isFinite(t)?Math.max(-16,Math.min(B,Math.round(t))):0}function le(e,t){let n=t.x-e.x,r=t.y-e.y;return Math.sqrt(n*n+r*r)}function ue(e,t){return{x:(e.x+t.x)/2,y:(e.y+t.y)/2}}function de(e){return[{label:`Simetría en eje X`,x:e.x,y:-e.y,color:`#2f80ed`,kind:`symmetry`,source:{x:e.x,y:e.y}},{label:`Simetría en eje Y`,x:-e.x,y:e.y,color:`#27ae60`,kind:`symmetry`,source:{x:e.x,y:e.y}},{label:`Simetría en origen`,x:-e.x,y:-e.y,color:`#8e44ad`,kind:`symmetry`,source:{x:e.x,y:e.y}}]}function H(e,t,n=performance.now()){let r=e.getContext(`2d`),i=e.getBoundingClientRect(),a=Math.max(240,Math.floor(Math.min(i.width,i.height||i.width))),o=Math.min(window.devicePixelRatio||1,2),s=Math.floor(a*o);(e.width!==s||e.height!==s)&&(e.width=s,e.height=s),r.setTransform(o,0,0,o,0,0),r.clearRect(0,0,a,a);let c=Y(a*.105*t.settings.visualScale,30,48),l={size:a,margin:c,plotSize:a-c*2};t.cartesian.transform=l,me(r,l,t.settings),t.labMode===`intervals`?ge(r,l,t,n):_e(r,l,t)}function fe(e,t,n,r){let i=r.getBoundingClientRect(),a=e.cartesian.transform;if(!a)return{x:0,y:0};let o=(t-i.left-a.margin)/a.plotSize*(B*2)-B,s=B-(n-i.top-a.margin)/a.plotSize*(B*2);return{x:V(o),y:V(s)}}function pe(e,t,n,r){let i=r.getBoundingClientRect(),a=e.cartesian.transform;if(!a)return null;let o=t-i.left,s=n-i.top,c=null,l=18;for(let t of e.cartesian.points){let e=K(t.x,t.y,a),n=Math.hypot(e.x-o,e.y-s);n<l&&(c=t,l=n)}return c}function me(e,t,n){let{size:r,margin:i,plotSize:a}=t;if(e.save(),ve(e,0,0,r,r,16),e.clip(),e.fillStyle=n.theme===`dark`?`#0f172a`:`#ffffff`,e.fillRect(0,0,r,r),e.fillStyle=n.theme===`dark`?`rgba(33, 46, 72, 0.92)`:`#fbfdff`,e.fillRect(i,i,a,a),n.showGrid)for(let n=-16;n<=B;n+=1){let r=K(n,n,t),o=n%4==0;e.strokeStyle=o?`rgba(71, 89, 120, 0.23)`:`rgba(71, 89, 120, 0.12)`,e.lineWidth=o?1.1:.7,q(e,r.x,i,r.x,i+a),q(e,i,r.y,i+a,r.y)}let o=K(0,0,t);e.strokeStyle=n.theme===`dark`?`#dce7f7`:`#1f2937`,e.lineWidth=2.2,q(e,i,o.y,i+a,o.y),q(e,o.x,i,o.x,i+a),J(e,i+a,o.y,0),J(e,i,o.y,Math.PI),J(e,o.x,i,-Math.PI/2),J(e,o.x,i+a,Math.PI/2),n.showNumbers&&he(e,t,n),e.restore()}function he(e,t,n){let{size:r,margin:i,plotSize:a}=t,o=K(0,0,t),s=r<380?4:2;e.fillStyle=n.theme===`dark`?`#d8e4f6`:`#1f2937`,e.font=`700 ${r<380?10:12}px "Nunito Sans", sans-serif`,e.textAlign=`center`,e.textBaseline=`top`;for(let n=-16;n<=B;n+=s){if(n===0)continue;let r=K(n,0,t).x,s=K(0,n,t).y;e.fillText(be(n),r,Math.min(i+a-14,o.y+6)),e.textAlign=`right`,e.textBaseline=`middle`,e.fillText(be(n),Math.max(22,o.x-7),s),e.textAlign=`center`,e.textBaseline=`top`}e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(`x`,i+a-10,o.y-14),e.fillText(`y`,o.x+10,i+10),e.textAlign=`right`,e.fillText(`0`,o.x-7,o.y+12)}function ge(e,t,n,r){let i=n.sets;for(let[n,r]of[[`A`,11],[`B`,8],[`C`,5]])i[n].visible!==!1&&U(e,t,[{start:i[n].start,end:i[n].end,leftClosed:i[n].leftClosed,rightClosed:i[n].rightClosed}].filter(()=>!i[n].empty),r,i[n].color,n,.88);let a=n.intervalResult;if(a?.ok){let i=r-(a.animatedAt||r),o=n.settings.animations?Y(i/650,.12,1):1;U(e,t,a.result,-4,`#e94d5f`,`Resultado`,o,!0),o<1&&(n.needsAnimation=!0)}}function U(e,t,n,r,i,a,o,s=!1){let c=K(0,r,t).y;e.save(),e.globalAlpha=o,e.lineCap=`round`,e.lineWidth=s?8:6,e.strokeStyle=i,e.fillStyle=i,e.font=`800 12px "Nunito Sans", sans-serif`,e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(a,t.margin+6,c-16),s&&(e.shadowColor=i,e.shadowBlur=15);for(let r of n){let n=K(Math.max(x.start,r.start),0,t).x,a=K(Math.min(x.end,r.end),0,t).x;q(e,n,c,a,c),W(e,n,c,r.leftClosed,i),W(e,a,c,r.rightClosed,i)}e.shadowBlur=0,e.font=`700 11px "Nunito Sans", sans-serif`,e.fillStyle=i,e.textAlign=`right`,e.fillText(w(n),t.margin+t.plotSize-4,c-16),e.restore()}function W(e,t,n,r,i){e.save(),e.lineWidth=2,e.strokeStyle=i,e.fillStyle=r?i:`#ffffff`,e.beginPath(),e.arc(t,n,5.5,0,Math.PI*2),e.fill(),e.stroke(),e.restore()}function _e(e,t,n){let r=n.cartesian.points;n.cartesian.connectSegments&&r.length>1&&(e.save(),e.strokeStyle=`rgba(47, 128, 237, 0.75)`,e.lineWidth=3,e.lineJoin=`round`,e.beginPath(),r.forEach((n,r)=>{let i=K(n.x,n.y,t);r===0?e.moveTo(i.x,i.y):e.lineTo(i.x,i.y)}),e.stroke(),e.restore());for(let r of n.cartesian.ghosts){let n=K(r.x,r.y,t);if(e.save(),e.globalAlpha=.7,e.strokeStyle=r.color,e.setLineDash([5,5]),r.kind===`midpoint`){e.setLineDash([]),e.lineWidth=2.5;let n=K(r.sources[0].x,r.sources[0].y,t),i=K(r.sources[1].x,r.sources[1].y,t);q(e,n.x,n.y,i.x,i.y)}else if(r.source){let i=K(r.source.x,r.source.y,t);q(e,i.x,i.y,n.x,n.y)}else{let r=K(0,0,t);q(e,r.x,r.y,n.x,n.y)}e.setLineDash([]),e.fillStyle=r.color,e.beginPath(),e.arc(n.x,n.y,6,0,Math.PI*2),e.fill(),G(e,`${r.label}: (${T(r.x)}, ${T(r.y)})`,n.x,n.y,r.color),e.restore()}for(let i of r){let r=K(i.x,i.y,t),a=i.id===n.cartesian.selectedId;e.save(),e.fillStyle=i.color,e.shadowColor=i.color,e.shadowBlur=a?18:8,e.beginPath(),e.arc(r.x,r.y,a?7.5:6,0,Math.PI*2),e.fill(),e.shadowBlur=0,a&&(e.strokeStyle=`#ffffff`,e.lineWidth=3,e.stroke()),G(e,`P${i.id} (${T(i.x)}, ${T(i.y)})`,r.x,r.y,i.color),e.restore()}}function G(e,t,n,r,i){e.font=`800 11px "Nunito Sans", sans-serif`;let a=e.measureText(t).width+10,o=e.canvas.getBoundingClientRect().width||e.canvas.width,s=Y(n+9,5,o-a-5),c=Y(r-25,5,o-24);e.fillStyle=`rgba(255, 255, 255, 0.90)`,ve(e,s,c,a,20,8),e.fill(),e.fillStyle=i,e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(t,s+5,c+10)}function K(e,t,n){return{x:n.margin+(e+B)/(B*2)*n.plotSize,y:n.margin+(B-t)/(B*2)*n.plotSize}}function q(e,t,n,r,i){e.beginPath(),e.moveTo(t,n),e.lineTo(r,i),e.stroke()}function J(e,t,n,r){e.save(),e.translate(t,n),e.rotate(r),e.beginPath(),e.moveTo(0,0),e.lineTo(-7,-4),e.lineTo(-7,4),e.closePath(),e.fillStyle=e.strokeStyle,e.fill(),e.restore()}function ve(e,t,n,r,i,a){let o=Math.min(a,r/2,i/2);e.beginPath(),e.moveTo(t+o,n),e.arcTo(t+r,n,t+r,n+i,o),e.arcTo(t+r,n+i,t,n+i,o),e.arcTo(t,n+i,t,n,o),e.arcTo(t,n,t+r,n,o),e.closePath()}function ye(e){let t=[`#e94d5f`,`#2f80ed`,`#27ae60`,`#8e44ad`,`#f2994a`,`#1abc9c`];return t[(e-1)%t.length]}function be(e){return e>0?`+${e}`:String(e)}function Y(e,t,n){return Math.max(t,Math.min(n,e))}var X=[{title:`Plano Cartesiano`,definition:`Sistema formado por dos rectas perpendiculares que permiten ubicar puntos mediante coordenadas.`,explanation:`El eje X mide la posición horizontal y el eje Y mide la posición vertical. El cruce de ambos es el origen (0, 0).`,example:`El punto (4, 3) está 4 unidades a la derecha y 3 unidades arriba del origen.`,commonError:`Intercambiar el orden de las coordenadas: primero va X y después Y.`,tip:`Lee cada punto como un recorrido: primero camina en horizontal y luego en vertical.`},{title:`Par Ordenado`,definition:`Expresión de la forma (x, y) que indica la posición exacta de un punto.`,explanation:`La primera coordenada siempre corresponde al eje X; la segunda corresponde al eje Y.`,example:`(−2, 5) significa 2 unidades a la izquierda y 5 unidades hacia arriba.`,commonError:`Pensar que (2, −5) y (−5, 2) representan el mismo lugar.`,tip:`El orden importa: un par ordenado cambia si se intercambian sus valores.`},{title:`Ejes Coordenados`,definition:`Rectas numéricas que dividen el plano en cuatro regiones.`,explanation:`El eje X es horizontal; el eje Y es vertical. Ambos permiten medir distancias desde el origen.`,example:`Los puntos sobre el eje X tienen y = 0; los puntos sobre el eje Y tienen x = 0.`,commonError:`Confundir un punto del eje con un punto del cuadrante.`,tip:`Si una coordenada es cero, el punto está sobre un eje.`},{title:`Cuadrantes`,definition:`Cuatro regiones del plano determinadas por los signos de x e y.`,explanation:`I: (+,+), II: (−,+), III: (−,−), IV: (+,−).`,example:`El punto (−3, 4) está en el cuadrante II.`,commonError:`Asignar cuadrantes sin revisar ambos signos.`,tip:`Memoriza el recorrido contrario a las manecillas del reloj: I, II, III, IV.`},{title:`Distancia entre dos puntos`,definition:`Medida del segmento que une dos puntos del plano.`,explanation:`Se calcula con la fórmula d = √((x₂−x₁)² + (y₂−y₁)²).`,example:`Entre (1, 2) y (4, 6): d = √(3² + 4²) = 5.`,commonError:`No elevar al cuadrado las diferencias antes de sumarlas.`,tip:`La fórmula nace del teorema de Pitágoras aplicado al plano.`},{title:`Punto medio`,definition:`Punto que queda exactamente a la mitad del segmento entre dos puntos.`,explanation:`Se obtiene promediando las coordenadas: M = ((x₁+x₂)/2, (y₁+y₂)/2).`,example:`Entre (−2, 4) y (6, 8): M = (2, 6).`,commonError:`Promediar solo una coordenada o sumar sin dividir entre dos.`,tip:`Si el punto medio está bien, su distancia a ambos extremos es igual.`},{title:`Simetría`,definition:`Transformación que refleja un punto respecto a un eje o al origen.`,explanation:`Respecto a X cambia el signo de y; respecto a Y cambia el signo de x; respecto al origen cambian ambos.`,example:`El punto (3, −5) reflejado en el eje Y es (−3, −5).`,commonError:`Cambiar el signo de la coordenada equivocada.`,tip:`Piensa en un espejo: el eje que usas como espejo no cambia.`},{title:`Intervalos`,definition:`Conjunto de números comprendidos entre dos extremos.`,explanation:`Los corchetes [ ] incluyen el extremo; los paréntesis ( ) lo excluyen.`,example:`[−1, 4) incluye −1, todos los valores intermedios y excluye 4.`,commonError:`Dibujar igual un extremo abierto y uno cerrado.`,tip:`Punto lleno significa incluido; punto vacío significa excluido.`},{title:`Operaciones entre conjuntos`,definition:`Procedimientos para combinar conjuntos y obtener nuevas regiones.`,explanation:`La unión junta, la intersección conserva lo común, la diferencia elimina y el complemento toma lo que falta en el universo.`,example:`Si A=[0,5] y B=[3,8], entonces A∩B=[3,5].`,commonError:`Confundir unión con intersección cuando los intervalos se superponen.`,tip:`Antes de operar, marca visualmente cada conjunto; la región resultado se vuelve evidente.`}],xe=[{expression:`A∪B`,label:`Unión básica`,note:`Combina todo lo que pertenece a A o a B.`},{expression:`A∩B`,label:`Intersección`,note:`Muestra solamente la parte común.`},{expression:`A−B`,label:`Diferencia`,note:`Quita de A la región que coincide con B.`},{expression:`A△B`,label:`Diferencia simétrica`,note:`Conserva las partes no compartidas.`},{expression:`(A∪B)−C`,label:`Expresión combinada`,note:`Primero une A y B, luego elimina C.`},{expression:`((A∩B)−C)'`,label:`Con complemento`,note:`Opera dentro del paréntesis y toma lo restante del universo.`},{expression:`A∪(B△C)`,label:`Con paréntesis internos`,note:`Resuelve B△C antes de unir con A.`}];function Se(e){let t=`A = ${w(C(e.A))}; B = ${w(C(e.B))}; C = ${w(C(e.C))}`,n=`A = ${w(C(e.A))}; B = ${w(C(e.B))}`,r=j(`A∩B`,e),i=j(`A∪B`,e),a=j(`(A∪B)−C`,e),o=j(`((A∩B)−C)'`,e);return[{type:`concept`,prompt:`¿Qué operación conserva únicamente los elementos comunes entre dos conjuntos?`,options:[`Unión`,`Intersección`,`Complemento`,`Diferencia simétrica`],answer:`Intersección`,explanation:`La intersección (∩) mantiene solo la parte compartida por los conjuntos.`},{type:`result`,prompt:`Con los intervalos actuales, ¿cuál es el resultado de A ∩ B?`,context:n,options:we([w(r.ok?r.result:[]),w(i.ok?i.result:[]),`∅`,`[−16, 16]`]),answer:w(r.ok?r.result:[]),explanation:`Se toma la región que A y B tienen en común.`},{type:`symbol`,prompt:`¿Qué símbolo representa la diferencia simétrica?`,options:[`∪`,`∩`,`△`,`'`],answer:`△`,explanation:`La diferencia simétrica se escribe △ y deja las partes que no se superponen.`},{type:`result`,prompt:`¿Qué resultado produce (A ∪ B) − C con los intervalos actuales?`,context:t,options:we([w(a.ok?a.result:[]),w(i.ok?i.result:[]),w(r.ok?r.result:[]),w(o.ok?o.result:[])]),answer:w(a.ok?a.result:[]),explanation:`Primero se reúnen A y B; después se elimina toda parte que pertenezca a C.`},{type:`interpretation`,prompt:`¿Cómo se interpreta el complemento A'?`,options:[`Todo lo que está dentro de A`,`Todo lo que no pertenece a A dentro del universo`,`La parte común de A y B`,`La distancia entre extremos`],answer:`Todo lo que no pertenece a A dentro del universo`,explanation:`El complemento toma los elementos del universo que quedan fuera del conjunto indicado.`}]}function Ce(e,t){let n=t.map((t,n)=>{let r=e[n]||``;return{prompt:t.prompt,context:t.context||``,selected:r,answer:t.answer,correct:r===t.answer,explanation:t.explanation}}),r=n.filter(e=>e.correct).length;return{correct:r,incorrect:t.length-r,score:Math.round(r/t.length*100),details:n}}function we(e){let t=[...new Set(e)];for(let e of[`∅`,`[−16, 16]`,`(−16, 16)`,`[0, 1]`]){if(t.length>=4)break;t.includes(e)||t.push(e)}return t.slice(0,4)}var Te=1,Ee={operaciones:`Operaciones`,ejemplos:`Ejemplos`,pasos:`Paso a paso`,historial:`Historial`,interpretacion:`Interpretación`,configuracion:`Configuración`};function De({mount:e,sdk:t,ready:n,tweaks:r,assets:i}){let a=Oe(),o=null,s=()=>{},c=0,l=0;return{start(){o=document.createElement(`section`),o.className=`coordimath-root`,e.replaceChildren(o),o.addEventListener(`click`,N),o.addEventListener(`input`,P),o.addEventListener(`change`,P),window.addEventListener(`resize`,G),s=()=>{window.removeEventListener(`resize`,G),o?.removeEventListener(`click`,N),o?.removeEventListener(`input`,P),o?.removeEventListener(`change`,P),cancelAnimationFrame(c),clearTimeout(l),e.replaceChildren()},p(),u(),d()},destroy(){s(),s=()=>{}},sdk:t,ready:n,tweaks:r,assets:i};async function u(){let e=i?.get(`COORDIMATH_MARK`)||``,t=i?.get(`COORDIMATH_BACKDROP`)||``;try{let[n,r]=await Promise.all([Ne(e),Ne(t)]);a.images.markUrl=n?.src||``,a.images.backdropUrl=r?.src||``}catch{a.assetError=`No se pudo cargar el arte; se usará el estilo base.`}finally{a.assetsReady=!0,p()}}async function d(){try{let e=await t.gameState.load();e?.version===Te&&(a.history=Array.isArray(e.history)?e.history.slice(0,12):[],a.bestScore=Number.isFinite(e.bestScore)?e.bestScore:0,e.settings&&(a.settings={...a.settings,...e.settings}))}catch{a.message={text:`El historial se mantendrá solo durante esta sesión.`,type:`info`}}p()}function f(){clearTimeout(l),l=window.setTimeout(async()=>{try{await t.gameState.save({version:Te,history:a.history.slice(0,12),bestScore:a.bestScore,settings:a.settings})}catch{}},250)}function p(){o&&(cancelAnimationFrame(c),o.innerHTML=`
      <div class="cm-app ${a.settings.theme===`dark`?`dark`:`light`} plane-${a.settings.planeSize}">
        <div class="cm-backdrop" ${a.images.backdropUrl?`style="background-image: url('${a.images.backdropUrl}')"`:``}></div>
        ${m()}
        <main class="cm-content">${h()}</main>
        ${a.message?`<div class="toast" role="status">${Q(a.message.text)}</div>`:``}
        ${M()}
      </div>
    `,W())}function m(){return`
      <header class="cm-topbar">
        <div class="brand-row">
          <div class="brand-title">
            ${a.images.markUrl?`<img src="${a.images.markUrl}" alt="Logo de CoordiMath">`:``}
            <div>
              <h1>CoordiMath</h1>
              <p class="brand-subtitle">Laboratorio interactivo del plano cartesiano e intervalos</p>
            </div>
          </div>
          <div class="mini-label">Universo: −16 a +16</div>
        </div>
        <nav class="view-nav" aria-label="Módulos principales">
          ${[[`inicio`,`Inicio`],[`aprender`,`Aprender`],[`laboratorio`,`Laboratorio`],[`evaluacion`,`Evaluación`],[`acerca`,`Acerca`]].map(([e,t])=>`<button type="button" class="chip ${a.view===e?`active`:``}" data-view="${e}">${t}</button>`).join(``)}
        </nav>
      </header>
    `}function h(){return a.view===`aprender`?_():a.view===`laboratorio`?ee():a.view===`evaluacion`?re():a.view===`acerca`?ae():g()}function g(){return`
      <section class="home-grid">
        <article class="cm-card hero-card">
          <div>
            <h2>Experimenta, visualiza y comprende.</h2>
            <p class="muted">CoordiMath convierte coordenadas, intervalos y operaciones entre conjuntos en gráficas claras con pasos explicados.</p>
          </div>
          <div class="hero-metrics">
            <div class="metric"><strong>4</strong><span>Módulos</span></div>
            <div class="metric"><strong>9</strong><span>Temas guiados</span></div>
            <div class="metric"><strong>5</strong><span>Operaciones</span></div>
          </div>
          <div class="home-actions">
            <button type="button" class="primary-btn" data-view="aprender">Aprender</button>
            <button type="button" class="primary-btn" data-view="laboratorio">Laboratorio</button>
            <button type="button" class="primary-btn" data-view="evaluacion">Evaluación</button>
            <button type="button" class="primary-btn" data-view="acerca">Acerca del proyecto</button>
            <button type="button" class="danger-btn" data-action="exit">Salir</button>
          </div>
        </article>
        <aside class="cm-card mini-graph-card" aria-hidden="true">
          ${ke()}
        </aside>
      </section>
    `}function _(){let e=X[a.activeTopic]||X[0];return`
      <section class="learn-grid">
        <div class="topic-list" role="list" aria-label="Temas">
          ${X.map((e,t)=>`
            <button type="button" class="topic-card ${t===a.activeTopic?`active`:``}" data-topic="${t}">
              <strong>${Q(e.title)}</strong>
              <span class="muted">Ver explicación y ejemplo</span>
            </button>
          `).join(``)}
        </div>
        <article class="learn-detail">
          <h2>${Q(e.title)}</h2>
          <div class="concept-grid">
            ${Z(`Definición`,e.definition)}
            ${Z(`Explicación sencilla`,e.explanation)}
            ${Z(`Ejemplo resuelto`,e.example)}
            ${Z(`Error común`,e.commonError)}
          </div>
          <div class="result-box"><strong>Recomendación</strong><span>${Q(e.tip)}</span></div>
          ${Ae(a.activeTopic)}
        </article>
      </section>
    `}function ee(){return`
      <section class="lab-view">
        <div class="plane-column">
          <div class="lab-mode-row">
            <button type="button" class="chip ${a.labMode===`intervals`?`active`:``}" data-lab-mode="intervals">Intervalos y conjuntos</button>
            <button type="button" class="chip ${a.labMode===`cartesian`?`active`:``}" data-lab-mode="cartesian">Plano cartesiano</button>
          </div>
          <div class="plane-wrap">
            <canvas id="coord-plane" class="plane-canvas" aria-label="Plano cartesiano de −16 a +16"></canvas>
          </div>
          <div class="plane-note">
            <span>Rango fijo: X = −16…+16, Y = −16…+16.</span>
            <span>${a.labMode===`cartesian`?`Toca para crear puntos; arrastra para moverlos.`:`Los intervalos se muestran por niveles y el resultado en rojo.`}</span>
          </div>
          ${k()}
        </div>
        <aside class="side-column">
          <div class="panel-tabs" aria-label="Paneles del laboratorio">
            ${Object.entries(Ee).map(([e,t])=>`<button type="button" class="chip ${a.activePanel===e?`active`:``}" data-panel="${e}">${t}</button>`).join(``)}
          </div>
          <section class="side-panel">${v()}</section>
        </aside>
      </section>
    `}function v(){return a.activePanel===`ejemplos`?te():a.activePanel===`pasos`?C():a.activePanel===`historial`?ne():a.activePanel===`interpretacion`?E():a.activePanel===`configuracion`?D():a.labMode===`cartesian`?x():y()}function y(){return`
      <h2>Operaciones</h2>
      <div>
        <div class="mini-label">Expresión</div>
        <div class="expression-display">${Q(a.expression)||`Selecciona símbolos`}</div>
      </div>
      ${O()}
      <div class="keypad">
        ${[`A`,`B`,`C`,`∪`,`∩`,`−`,`△`,`'`,`(`,`)`].map(e=>`<button type="button" class="key-btn" data-key="${e}">${e}</button>`).join(``)}
        <button type="button" class="key-btn" data-key="back">⌫</button>
        <button type="button" class="key-btn" data-key="clear">Limpiar</button>
      </div>
      <div class="button-row">
        <button type="button" class="primary-btn" data-action="resolve-expression">Resolver</button>
        <button type="button" class="ghost-btn" data-key="clear">Borrar expresión</button>
      </div>
      <div class="set-grid">${[`A`,`B`,`C`].map(b).join(``)}</div>
    `}function b(e){let t=a.sets[e],n=`${t.leftClosed?`[`:`(`}${t.rightClosed?`]`:`)`}`;return`
      <div class="set-editor ${t.visible===!1?`is-muted`:``}">
        <div class="set-title"><span><span class="color-dot" style="background:${t.color}"></span> Conjunto ${e}</span><span>${t.empty?`∅`:n.replace(`]`,`, b]`).replace(`)`,`, b)`).replace(`[`,`[a`).replace(`(`,`(a`)}</span></div>
        <div class="field-grid">
          <label class="field"><span>Izquierdo</span><input type="number" min="-16" max="15" step="1" value="${t.start}" data-set="${e}" data-set-field="start" ${t.empty?`disabled`:``}></label>
          <label class="field"><span>Derecho</span><input type="number" min="-15" max="16" step="1" value="${t.end}" data-set="${e}" data-set-field="end" ${t.empty?`disabled`:``}></label>
          <label class="field"><span>Tipo</span><select data-set="${e}" data-set-field="type" ${t.empty?`disabled`:``}>
            ${[`()`,`[]`,`(]`,`[)`].map(e=>`<option value="${e}" ${e===n?`selected`:``}>${e.replace(`(`,`(a, b`).replace(`[`,`[a, b`).replace(`)`,`)`).replace(`]`,`]`)}</option>`).join(``)}
          </select></label>
          <label class="field"><span>Color</span><input type="color" value="${t.color}" data-set="${e}" data-set-field="color"></label>
        </div>
        <div class="button-row">
          <button type="button" class="small-btn" data-action="toggle-set-visible" data-set-target="${e}">${t.visible===!1?`Mostrar en gráfica`:`Ocultar de gráfica`}</button>
          <button type="button" class="small-btn" data-action="toggle-set-empty" data-set-target="${e}">${t.empty?`Restaurar conjunto`:`Vaciar conjunto`}</button>
        </div>
      </div>
    `}function x(){let e=a.cartesian.points.find(e=>e.id===a.cartesian.selectedId);return`
      <h2>Plano cartesiano</h2>
      <div class="field-grid">
        <label class="field"><span>X</span><input type="number" min="-16" max="16" step="1" value="${a.pointDraft.x}" data-draft-point="x"></label>
        <label class="field"><span>Y</span><input type="number" min="-16" max="16" step="1" value="${a.pointDraft.y}" data-draft-point="y"></label>
      </div>
      <div class="button-row">
        <button type="button" class="primary-btn" data-action="add-point">Agregar punto</button>
        <button type="button" class="ghost-btn" data-action="toggle-segments">${a.cartesian.connectSegments?`Ocultar segmentos`:`Unir segmentos`}</button>
      </div>
      <div class="button-row">
        <button type="button" class="ghost-btn" data-action="measure-points">Distancia y punto medio</button>
        <button type="button" class="ghost-btn" data-action="symmetry-point" ${e?``:`disabled`}>Simetrías</button>
      </div>
      <div class="point-list">
        ${a.cartesian.points.length===0?`<div class="empty-state">Aún no hay puntos. Toca el plano o usa Agregar punto.</div>`:a.cartesian.points.map(S).join(``)}
      </div>
      <div class="button-row"><button type="button" class="danger-btn" data-action="clear-points">Vaciar puntos</button></div>
      ${a.cartesian.summary?`<div class="result-box"><strong>Resultado</strong><span>${Q(a.cartesian.summary)}</span></div>`:``}
    `}function S(e){return`
      <div class="point-row">
        <strong><span class="color-dot" style="background:${e.color}"></span> P${e.id}</strong>
        <div class="field-grid">
          <label class="field"><span>X</span><input type="number" min="-16" max="16" step="1" value="${e.x}" data-point="${e.id}" data-point-field="x"></label>
          <label class="field"><span>Y</span><input type="number" min="-16" max="16" step="1" value="${e.y}" data-point="${e.id}" data-point-field="y"></label>
        </div>
        <div class="button-row">
          <button type="button" class="small-btn" data-action="select-point" data-point="${e.id}">${e.id===a.cartesian.selectedId?`Seleccionado`:`Seleccionar`}</button>
          <button type="button" class="small-btn" data-action="delete-point" data-point="${e.id}">Eliminar</button>
        </div>
      </div>
    `}function te(){return a.labMode===`cartesian`?`
        <h2>Ejemplos</h2>
        <p class="muted">Crea dos puntos propios y usa distancia, punto medio o simetrías para observar el procedimiento.</p>
        <div class="example-list">
          <button type="button" class="example-btn" data-action="set-draft" data-x="4" data-y="3">Preparar punto (4, 3)</button>
          <button type="button" class="example-btn" data-action="set-draft" data-x="-5" data-y="6">Preparar punto (−5, 6)</button>
          <button type="button" class="example-btn" data-action="set-draft" data-x="7" data-y="-2">Preparar punto (7, −2)</button>
        </div>
      `:`
      <h2>Ejemplos</h2>
      <div class="example-list">
        ${xe.map(e=>`
          <button type="button" class="example-btn" data-example="${e.expression}">
            <strong>${Q(e.label)}</strong><br><span class="muted">${Q(e.expression)} · ${Q(e.note)}</span>
          </button>
        `).join(``)}
      </div>
    `}function C(){let e=a.labMode===`cartesian`?a.cartesian.steps:a.intervalResult?.steps||[];return`
      <h2>Paso a paso</h2>
      <div class="step-list">
        ${e.length===0?`<div class="empty-state">Resuelve una expresión o calcula una medida para ver el procedimiento.</div>`:e.map((e,t)=>`
          <div class="step-item"><strong>${t+1}. ${Q(e.operation)}</strong><br><span>${Q(e.detail)}</span><br><span class="result-text">${Q(e.result)}</span></div>
        `).join(``)}
      </div>
    `}function ne(){return`
      <h2>Historial</h2>
      <div class="history-list">
        ${a.history.length===0?`<div class="empty-state">Las operaciones resueltas aparecerán aquí.</div>`:a.history.map(e=>`
          <div class="history-item">
            <strong>${Q(e.expression)}</strong><br>
            <span class="result-text">${Q(e.resultText)}</span><br>
            <span class="mini-label">${Q(e.time)}</span>
            <div class="button-row">
              <button type="button" class="small-btn" data-action="use-history" data-history="${e.id}">Ver</button>
              <button type="button" class="small-btn" data-action="delete-history" data-history="${e.id}">Eliminar</button>
            </div>
          </div>
        `).join(``)}
      </div>
      ${a.history.length>0?`<button type="button" class="danger-btn" data-action="clear-history">Limpiar historial</button>`:``}
    `}function E(){return`
      <h2>Interpretación matemática</h2>
      <div class="result-box"><p>${Q(a.labMode===`cartesian`?a.cartesian.interpretation||`Selecciona puntos y calcula una medida para interpretar el resultado.`:a.intervalResult?.interpretation||`Construye una expresión para explicar su significado matemático.`)}</p></div>
    `}function D(){return`
      <h2>Configuración</h2>
      <label class="field"><span>Cuadrícula</span><select data-setting="showGrid"><option value="true" ${a.settings.showGrid?`selected`:``}>Mostrar</option><option value="false" ${a.settings.showGrid?``:`selected`}>Ocultar</option></select></label>
      <label class="field"><span>Numeración</span><select data-setting="showNumbers"><option value="true" ${a.settings.showNumbers?`selected`:``}>Mostrar</option><option value="false" ${a.settings.showNumbers?``:`selected`}>Ocultar</option></select></label>
      <label class="field"><span>Animaciones</span><select data-setting="animations"><option value="true" ${a.settings.animations?`selected`:``}>Activar</option><option value="false" ${a.settings.animations?``:`selected`}>Desactivar</option></select></label>
      <label class="field"><span>Tamaño de visualización</span><input type="range" min="0.85" max="1.12" step="0.01" value="${a.settings.visualScale}" data-setting="visualScale"></label>
      <label class="field"><span>Tamaño del plano</span><select data-setting="planeSize"><option value="normal" ${a.settings.planeSize===`normal`?`selected`:``}>Normal</option><option value="large" ${a.settings.planeSize===`large`?`selected`:``}>Grande</option><option value="compact" ${a.settings.planeSize===`compact`?`selected`:``}>Compacto</option></select></label>
      <label class="field"><span>Modo</span><select data-setting="theme"><option value="light" ${a.settings.theme===`light`?`selected`:``}>Claro</option><option value="dark" ${a.settings.theme===`dark`?`selected`:``}>Oscuro</option></select></label>
    `}function O(){return a.intervalResult?a.intervalResult.ok?`<div class="result-box"><strong>Resultado</strong><span class="result-text">${Q(w(a.intervalResult.result))}</span></div>`:`<div class="result-box error"><strong>Validación</strong><span>${Q(a.intervalResult.error)}</span></div>`:``}function k(){return a.labMode!==`intervals`||!a.intervalResult?``:a.intervalResult.ok?`<div class="result-box lab-quick-result"><strong>${Q(a.expression||`Resultado`)}</strong><span class="result-text">${Q(w(a.intervalResult.result))}</span></div>`:`<div class="result-box lab-quick-result error"><strong>Revisar</strong><span>${Q(a.intervalResult.error)}</span></div>`}function re(){if(!a.quiz.started)return`
        <section class="quiz-layout">
          <article class="quiz-card">
            <h2>Evaluación</h2>
            <p class="muted">Genera ejercicios automáticos sobre intervalos, operaciones e interpretación. Se usará la configuración actual de A, B y C.</p>
            <button type="button" class="primary-btn" data-action="start-quiz">Comenzar evaluación</button>
          </article>
          <aside class="quiz-card"><h2>Mejor puntaje</h2><div class="metric"><strong>${a.bestScore}</strong><span>puntos</span></div></aside>
        </section>
      `;if(a.quiz.finished)return A();let e=a.quiz.questions[a.quiz.index],t=a.quiz.answers[a.quiz.index];return`
      <section class="quiz-layout">
        <article class="quiz-card">
          <div class="progress-bar"><div class="progress-fill" style="width:${(a.quiz.index+1)/a.quiz.questions.length*100}%"></div></div>
          <h2>Pregunta ${a.quiz.index+1} de ${a.quiz.questions.length}</h2>
          <p>${Q(e.prompt)}</p>
          ${e.context?`<div class="quiz-context"><strong>Intervalos usados</strong><span>${Q(e.context)}</span></div>`:``}
          <div class="answer-grid">
            ${e.options.map(e=>`<button type="button" class="answer-btn ${t===e?`active`:``}" data-answer="${Q(e)}">${Q(e)}</button>`).join(``)}
          </div>
          ${t?`<div class="button-row"><button type="button" class="primary-btn" data-action="next-question">${a.quiz.index===a.quiz.questions.length-1?`Finalizar`:`Siguiente`}</button></div>`:``}
        </article>
        <aside class="quiz-card"><h2>Consejo</h2><p class="muted">Antes de responder, imagina qué región quedaría coloreada en rojo en el laboratorio.</p></aside>
      </section>
    `}function A(){let e=a.quiz.result;return`
      <section class="quiz-layout">
        <article class="quiz-card">
          <h2>Puntaje obtenido: ${e.score}</h2>
          <div class="hero-metrics">
            <div class="metric"><strong>${e.correct}</strong><span>Correctas</span></div>
            <div class="metric"><strong>${e.incorrect}</strong><span>Incorrectas</span></div>
            <div class="metric"><strong>${a.bestScore}</strong><span>Mejor</span></div>
          </div>
          <div class="step-list">
            ${e.details.map((e,t)=>`
              <div class="step-item">
                <strong>${t+1}. ${e.correct?`Correcta`:`Revisar`}</strong><br>
                <span>${Q(e.prompt)}</span><br>
                ${e.context?`<span>Intervalos: ${Q(e.context)}</span><br>`:``}
                <span>Tu respuesta: ${Q(e.selected||`Sin responder`)}</span><br>
                <span class="result-text">Respuesta: ${Q(e.answer)}</span><br>
                <span>${Q(e.explanation)}</span>
              </div>
            `).join(``)}
          </div>
          <button type="button" class="primary-btn" data-action="restart-quiz">Nueva evaluación</button>
        </article>
        <aside class="quiz-card"><h2>Autoevaluación</h2><p class="muted">Vuelve al laboratorio para modificar los intervalos y generar una prueba distinta.</p></aside>
      </section>
    `}function ae(){return`
      <section class="home-grid">
        <article class="cm-card hero-card">
          <h2>Acerca del proyecto</h2>
          <p>CoordiMath es un laboratorio matemático moderno para practicar el plano cartesiano, los intervalos y las operaciones entre conjuntos mediante representación gráfica y explicación paso a paso.</p>
          <p class="muted">Su diseño prioriza un plano siempre legible, validaciones claras, navegación fluida y una experiencia ordenada para estudiantes.</p>
          <button type="button" class="primary-btn" data-view="laboratorio">Abrir laboratorio</button>
        </article>
        <aside class="cm-card hero-card">
          <h2>Operaciones soportadas</h2>
          <p>Unión (∪), intersección (∩), diferencia (−), complemento (') y diferencia simétrica (△), incluyendo expresiones con paréntesis.</p>
        </aside>
      </section>
    `}function M(){return`
      <div class="start-overlay" ${a.overlayDismissed?`hidden`:``}>
        <button type="button" class="start-prompt" data-action="start-app" ${a.assetsReady?``:`disabled`}>
          <h2>CoordiMath</h2>
          <p>${a.assetsReady?`Toca para empezar`:`Cargando laboratorio…`}</p>
          ${a.assetError?`<p>${Q(a.assetError)}</p>`:``}
        </button>
      </div>
    `}function N(e){let t=e.target.closest(`button`);if(!t)return;let{action:n,view:r,topic:i,labMode:o,panel:s,key:c,example:l,answer:u,history:d,point:f,x:m,y:h,setTarget:g}=t.dataset;if(n===`start-app`){if(!a.assetsReady)return;a.overlayDismissed=!0,p();return}if(a.overlayDismissed){if(r){a.view=r,a.message=null,p();return}if(i){a.activeTopic=Number(i),p();return}if(o){a.labMode=o,p();return}if(s){a.activePanel=s,p();return}if(c){oe(c);return}if(l){a.expression=l,a.activePanel=`operaciones`,I(!1),K(`Ejemplo cargado en el editor.`);return}if(d){R(n,d);return}if(u){a.quiz.answers[a.quiz.index]=u,p();return}if(f&&(n===`select-point`||n===`delete-point`)){z(n,Number(f));return}if(g&&(n===`toggle-set-visible`||n===`toggle-set-empty`)){n===`toggle-set-visible`?a.sets[g].visible=a.sets[g].visible===!1:a.sets[g].empty=!a.sets[g].empty,a.intervalResult=a.expression?j(a.expression,a.sets):null,a.intervalResult?.ok&&(a.intervalResult.animatedAt=performance.now()),p();return}if(n===`set-draft`){a.pointDraft={x:Number(m),y:Number(h)},a.activePanel=`operaciones`,K(`Coordenadas preparadas. Pulsa Agregar punto para graficarlas.`);return}F(n)}}function P(e){let t=e.target;if(!(t instanceof HTMLInputElement)&&!(t instanceof HTMLSelectElement)||!a.overlayDismissed&&!t.closest(`.start-overlay`))return;let{set:n,setField:r,setting:i,draftPoint:o,point:s,pointField:c}=t.dataset;if(n&&r){let i=e.type===`input`&&(r===`start`||r===`end`);L(n,r,t.value,!i),i&&G();return}if(i){se(i,t.value);return}if(o){a.pointDraft[o]=V(t.value),G();return}if(s&&c){let e=a.cartesian.points.find(e=>e.id===Number(s));e&&(e[c]=V(t.value),a.cartesian.ghosts=[],G())}}function F(e){e===`resolve-expression`?I(!0):e===`exit`?K(`Puedes cerrar la pestaña o volver a la pantalla de inicio cuando quieras.`):e===`add-point`?B(a.pointDraft.x,a.pointDraft.y):e===`toggle-segments`?(a.cartesian.connectSegments=!a.cartesian.connectSegments,p()):e===`measure-points`?me():e===`symmetry-point`?he():e===`clear-points`?(a.cartesian.points=[],a.cartesian.ghosts=[],a.cartesian.selectedId=null,a.cartesian.summary=`Se vació el conjunto de puntos del plano.`,a.cartesian.steps=[],p()):e===`clear-history`?(a.history=[],f(),p()):e===`start-quiz`||e===`restart-quiz`?(a.quiz={started:!0,finished:!1,questions:Se(a.sets),answers:{},index:0,result:null},p()):e===`next-question`&&ge()}function oe(e){if(e===`clear`){a.expression=``,a.intervalResult=null,p();return}if(e===`back`){a.expression=a.expression.slice(0,-1),a.intervalResult=null,p();return}if(!ie(a.expression,e)){a.intervalResult={ok:!1,error:`Ese símbolo no puede colocarse en esa posición.`},p();return}a.expression+=e,a.intervalResult=null,p()}function I(e){let t=j(a.expression,a.sets);if(!t.ok){a.intervalResult=t,a.activePanel=`operaciones`,p();return}a.intervalResult={...t,ok:!0,animatedAt:performance.now()},a.activePanel=e?`pasos`:a.activePanel,e&&(a.history.unshift({id:String(Date.now()),expression:a.expression,resultText:w(t.result),time:new Date().toLocaleTimeString(`es`,{hour:`2-digit`,minute:`2-digit`}),sets:Me(a.sets)}),a.history=a.history.slice(0,12),f()),p()}function L(e,t,n,r=!0){let i=a.sets[e];t===`type`?(i.leftClosed=n.startsWith(`[`),i.rightClosed=n.endsWith(`]`)):t===`color`?i.color=n:i[t]=V(n),a.intervalResult=a.expression?j(a.expression,a.sets):null,a.intervalResult?.ok&&(a.intervalResult.animatedAt=performance.now()),r&&p()}function se(e,t){[`showGrid`,`showNumbers`,`animations`].includes(e)?a.settings[e]=t===`true`:e===`visualScale`?a.settings.visualScale=Number(t):e===`planeSize`?a.settings.planeSize=t:e===`theme`&&(a.settings.theme=t),f(),p()}function R(e,t){let n=a.history.find(e=>e.id===t);if(n){if(e===`delete-history`){a.history=a.history.filter(e=>e.id!==t),f(),p();return}e===`use-history`&&(a.sets=Me(n.sets),a.expression=n.expression,a.labMode=`intervals`,a.activePanel=`pasos`,I(!1))}}function z(e,t){e===`select-point`?a.cartesian.selectedId=t:e===`delete-point`&&(a.cartesian.points=a.cartesian.points.filter(e=>e.id!==t),a.cartesian.selectedId===t&&(a.cartesian.selectedId=null),a.cartesian.ghosts=[]),p()}function B(e,t){let n=ce(a.cartesian.nextId,e,t);a.cartesian.nextId+=1,a.cartesian.points.push(n),a.cartesian.selectedId=n.id,a.cartesian.ghosts=[],a.cartesian.summary=`Se graficó P${n.id} en (${n.x}, ${n.y}).`,a.cartesian.interpretation=`Cada punto se ubica leyendo primero la coordenada horizontal y luego la vertical.`,p()}function me(){if(a.cartesian.points.length<2){a.cartesian.summary=`Necesitas al menos dos puntos para calcular distancia y punto medio.`,p();return}let[e,t]=a.cartesian.points.slice(0,2),n=le(e,t),r=ue(e,t);a.cartesian.ghosts=[{label:`Punto medio`,x:r.x,y:r.y,color:`#f2994a`,kind:`midpoint`,sources:[{x:e.x,y:e.y},{x:t.x,y:t.y}]}],a.cartesian.summary=`Entre P${e.id} y P${t.id}: distancia = ${T(n)}, punto medio = (${T(r.x)}, ${T(r.y)}).`,a.cartesian.steps=[{operation:`Diferencias`,detail:`Δx = ${t.x} − ${e.x}; Δy = ${t.y} − ${e.y}`,result:`Δx = ${t.x-e.x}, Δy = ${t.y-e.y}`},{operation:`Distancia`,detail:`d = √((x₂−x₁)² + (y₂−y₁)²)`,result:`d = ${T(n)}`},{operation:`Punto medio`,detail:`M = ((x₁+x₂)/2, (y₁+y₂)/2)`,result:`M = (${T(r.x)}, ${T(r.y)})`}],a.cartesian.interpretation=`La distancia mide la longitud del segmento; el punto medio divide ese segmento en dos partes iguales.`,a.activePanel=`pasos`,p()}function he(){let e=a.cartesian.points.find(e=>e.id===a.cartesian.selectedId);e&&(a.cartesian.ghosts=de(e),a.cartesian.summary=`Simetrías de P${e.id}: eje X (${e.x}, ${-e.y}), eje Y (${-e.x}, ${e.y}) y origen (${-e.x}, ${-e.y}).`,a.cartesian.steps=[{operation:`Respecto al eje X`,detail:`Se conserva x y cambia el signo de y.`,result:`(${e.x}, ${-e.y})`},{operation:`Respecto al eje Y`,detail:`Cambia el signo de x y se conserva y.`,result:`(${-e.x}, ${e.y})`},{operation:`Respecto al origen`,detail:`Cambian los signos de ambas coordenadas.`,result:`(${-e.x}, ${-e.y})`}],a.cartesian.interpretation=`La simetría refleja el punto como si el eje elegido fuera un espejo.`,a.activePanel=`pasos`,p())}function ge(){if(a.quiz.index<a.quiz.questions.length-1){a.quiz.index+=1,p();return}a.quiz.result=Ce(a.quiz.answers,a.quiz.questions),a.quiz.finished=!0,a.bestScore=Math.max(a.bestScore,a.quiz.result.score),f(),U(a.quiz.result.score),p()}async function U(e){if(Number.isFinite(e))try{await t.leaderboard.submit(e)}catch{}}function W(){let e=o?.querySelector(`#coord-plane`);if(!e)return;let t=()=>H(e,a);if(t(),a.labMode===`cartesian`&&_e(e,t),a.needsAnimation){let t=()=>{a.needsAnimation=!1,H(e,a),a.needsAnimation&&(c=requestAnimationFrame(t))};c=requestAnimationFrame(t)}}function _e(e,t){let n=null;e.addEventListener(`pointerdown`,r=>{r.preventDefault();let i=pe(a,r.clientX,r.clientY,e);if(i)n=i.id,a.cartesian.selectedId=i.id;else{let t=fe(a,r.clientX,r.clientY,e);B(t.x,t.y);return}e.setPointerCapture(r.pointerId),t()}),e.addEventListener(`pointermove`,r=>{if(!n)return;let i=a.cartesian.points.find(e=>e.id===n);if(!i)return;let o=fe(a,r.clientX,r.clientY,e);i.x=o.x,i.y=o.y,a.cartesian.ghosts=[],a.cartesian.summary=`P${i.id} se movió a (${i.x}, ${i.y}).`,t()}),e.addEventListener(`pointerup`,t=>{n&&(n=null,e.releasePointerCapture(t.pointerId),p())})}function G(){let e=o?.querySelector(`#coord-plane`);e&&requestAnimationFrame(()=>H(e,a))}function K(e){a.message={text:e,type:`info`},p(),window.setTimeout(()=>{a.message?.text===e&&(a.message=null,p())},2100)}}function Oe(){let e={A:{start:-8,end:5,leftClosed:!0,rightClosed:!1,color:`#2f80ed`,empty:!1,visible:!0},B:{start:-3,end:11,leftClosed:!0,rightClosed:!0,color:`#27ae60`,empty:!1,visible:!0},C:{start:2,end:14,leftClosed:!1,rightClosed:!0,color:`#8e44ad`,empty:!1,visible:!0}},t=j(`(A∪B)−C`,e);return{view:`inicio`,overlayDismissed:!1,assetsReady:!1,assetError:``,images:{markUrl:``,backdropUrl:``},activeTopic:0,labMode:`intervals`,activePanel:`operaciones`,sets:e,expression:`(A∪B)−C`,intervalResult:t.ok?{...t,ok:!0,animatedAt:performance.now()}:null,history:[],settings:{showGrid:!0,showNumbers:!0,animations:!0,visualScale:1,planeSize:`normal`,theme:`light`},pointDraft:{x:4,y:3},cartesian:{points:[],nextId:1,selectedId:null,connectSegments:!0,ghosts:[],summary:``,interpretation:``,steps:[],transform:null},quiz:{started:!1,finished:!1,questions:[],answers:{},index:0,result:null},bestScore:0,needsAnimation:!1,message:null}}function Z(e,t){return`<div class="concept-box"><h3>${Q(e)}</h3><p>${Q(t)}</p></div>`}function ke(){return je(`
    <line class="svg-line blue" x1="64" y1="132" x2="136" y2="62" />
    <circle class="svg-dot green" cx="64" cy="132" r="5" />
    <circle class="svg-dot red" cx="136" cy="62" r="5" />
    <line class="svg-line soft" x1="42" y1="158" x2="158" y2="158" />
    <line class="svg-line result" x1="54" y1="158" x2="145" y2="158" />
    <circle class="svg-end open" cx="54" cy="158" r="5" />
    <circle class="svg-end closed" cx="145" cy="158" r="5" />
    <text class="svg-label" x="126" y="50">(4, 3)</text>
    <text class="svg-label" x="48" y="146">A∪B</text>
  `,`mini-graph-svg`,`Vista previa de puntos e intervalos`)}function Ae(e){let t=[`<line class="svg-line blue" x1="62" y1="132" x2="138" y2="66" /><circle class="svg-dot green" cx="62" cy="132" r="5" /><circle class="svg-dot red" cx="138" cy="66" r="5" /><text class="svg-label" x="138" y="52">I</text><text class="svg-label" x="48" y="146">III</text>`,`<line class="svg-guide" x1="100" y1="100" x2="140" y2="100" /><line class="svg-guide" x1="140" y1="100" x2="140" y2="70" /><circle class="svg-dot red" cx="140" cy="70" r="5" /><text class="svg-label" x="122" y="58">(4, 3)</text><text class="svg-small" x="116" y="113">x = 4</text><text class="svg-small" x="145" y="87">y = 3</text>`,`<text class="svg-label" x="150" y="93">Eje X</text><text class="svg-label" x="106" y="30">Eje Y</text><text class="svg-label" x="92" y="116">0</text><circle class="svg-dot orange" cx="100" cy="100" r="4" />`,`<text class="svg-quadrant" x="142" y="58">I (+,+)</text><text class="svg-quadrant" x="42" y="58">II (−,+)</text><text class="svg-quadrant" x="34" y="146">III (−,−)</text><text class="svg-quadrant" x="136" y="146">IV (+,−)</text>`,`<line class="svg-guide" x1="62" y1="134" x2="138" y2="134" /><line class="svg-guide" x1="138" y1="134" x2="138" y2="54" /><line class="svg-line blue" x1="62" y1="134" x2="138" y2="54" /><circle class="svg-dot green" cx="62" cy="134" r="5" /><circle class="svg-dot red" cx="138" cy="54" r="5" /><text class="svg-label" x="96" y="86">d</text>`,`<line class="svg-line blue" x1="58" y1="136" x2="142" y2="58" /><circle class="svg-dot green" cx="58" cy="136" r="5" /><circle class="svg-dot red" cx="142" cy="58" r="5" /><circle class="svg-dot orange" cx="100" cy="97" r="6" /><text class="svg-label" x="106" y="91">M</text>`,`<line class="svg-guide" x1="100" y1="24" x2="100" y2="176" /><line class="svg-line purple" x1="140" y1="68" x2="60" y2="68" /><circle class="svg-dot red" cx="140" cy="68" r="5" /><circle class="svg-dot purple" cx="60" cy="68" r="5" /><text class="svg-label" x="66" y="56">reflejo</text>`,`<line class="svg-line dark" x1="34" y1="106" x2="166" y2="106" /><line class="svg-line blue" x1="66" y1="106" x2="138" y2="106" /><circle class="svg-end open" cx="66" cy="106" r="6" /><circle class="svg-end closed" cx="138" cy="106" r="6" /><text class="svg-label" x="79" y="88">(−2, 6]</text>`,`<line class="svg-line soft" x1="32" y1="86" x2="168" y2="86" /><line class="svg-line blue" x1="48" y1="76" x2="128" y2="76" /><line class="svg-line green" x1="82" y1="96" x2="154" y2="96" /><line class="svg-line result" x1="82" y1="118" x2="128" y2="118" /><text class="svg-label" x="84" y="54">A ∩ B</text>`];return je(t[e]||t[0],`learn-graph`,`Representación gráfica del tema`)}function je(e,t,n){return`
    <svg class="${t}" viewBox="0 0 200 200" role="img" aria-label="${Q(n)}">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(93,114,145,.18)" stroke-width="1"/></pattern>
      </defs>
      <rect width="200" height="200" rx="18" fill="#fff" />
      <rect width="200" height="200" rx="18" fill="url(#grid)" />
      <line class="svg-axis" x1="100" y1="16" x2="100" y2="184" />
      <line class="svg-axis" x1="16" y1="100" x2="184" y2="100" />
      ${e}
    </svg>
  `}function Me(e){return Object.fromEntries(Object.entries(e).map(([e,t])=>[e,{...t}]))}function Ne(e){return e?new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.onload=()=>t(r),r.onerror=()=>n(Error(`No se pudo cargar ${e}`)),r.src=e}):Promise.resolve(null)}function Q(e){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}var Pe={},$={COORDIMATH_MARK:`/generated-assets/coordimath_mark-transparent.webp`,COORDIMATH_BACKDROP:`/generated-assets/coordimath_backdrop.webp`};De({mount:document.querySelector(`#app`),sdk:b,ready:await b.ready(),tweaks:await b.tweaks.init(Pe),assets:Object.keys($).length>0?await b.assets.register($):void 0}).start();