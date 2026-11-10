'use strict';
/* PULSE - core: helpers, the timeline, the rhythms (shared with score.py), the path the line runs along. */
/* two formats from one film: 9:16 (default) and 1:1 (open index.html?ar=1x1) */
const SQ=new URLSearchParams(location.search).get('ar')==='1x1';
const W=1080,H=SQ?1080:1920,TAU=Math.PI*2,PI=Math.PI,BG='#070b18',TOTAL=56;
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const ss=(a,b,x)=>{x=cl((x-a)/(b-a));return x*x*(3-2*x);},eo=x=>1-Math.pow(1-cl(x),3);
const R=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mixc=(a,b,t,al=1)=>{const p=hex(a),q=hex(b);t=cl(t);return `rgba(${Math.round(lerp(p[0],q[0],t))},${Math.round(lerp(p[1],q[1],t))},${Math.round(lerp(p[2],q[2],t))},${al})`;};
const rgba=(h,a)=>{const p=hex(h);return `rgba(${p[0]},${p[1]},${p[2]},${a})`;};
const COL={green:'#4dffa0',gold:'#ffd166',trace:'#2b3a6e',fog:'#8d96ad',rain:'#5ad8ff',train:'#ffa23a',dhol:'#ff4f8f',mari:'#ffb52e',rope:'#d58cff',sea:'#3fe6c0',warm:'#ffc27a'};
const BEADS=[COL.rain,COL.train,COL.dhol,COL.rope,COL.sea];

/* ---------- timeline ---------- */
const T={flat:3.2,stir:3.5,slide:3.9,out:4.4,EXT:5,FOG:32,CRY:38.4,SPIKE:39,HOME:41,ROOM:47,IN:47.5,BEEP:49.5,TITLE:53};
const V=540,X0=-160,XFOG=X0+(T.FOG-T.EXT)*V,XSTOP=XFOG+V*3;
/* the line slows down where a rhythm is made (the dhol player, the skipping rope) and hurries between */
const KEYS=[[5,-160],[17.3,6482],[19.5,7700],[22,8150],[23.3,9720],[24.3,10400],[26.3,11100],[27.3,11880],[32,14420]];
function rawX(t){for(let i=1;i<KEYS.length;i++)if(t<=KEYS[i][0])return lerp(KEYS[i-1][1],KEYS[i][1],(t-KEYS[i-1][0])/(KEYS[i][0]-KEYS[i-1][0]));return KEYS[KEYS.length-1][1];}
function headX(t){
  if(t<T.FOG){let x=0;for(let k=-2;k<=2;k++)x+=rawX(cl(t+k*.12,T.EXT,T.FOG));return x/5;}
  if(t<38){const u=t-T.FOG;return XFOG+V*(u-u*u/12);}
  if(t<T.HOME)return XSTOP;
  if(t<46)return lerp(XSTOP,X0+60,Math.pow((t-T.HOME)/5,1.12));
  return lerp(X0+60,X0-40,ss(46,46.8,t));
}
const revealX=t=>t<38?headX(t):1e9;
/* rhythm layers: 16th-note steps (0.125 s) inside a 2 s bar. on/off = when the layer plays on the way out. */
const LAYERS={
  rain:{pat:[0,3,6,8,11,14],on:8,off:36,k:9},
  train:{pat:[0,2,8,10],on:12,off:35,k:10},
  dholLo:{pat:[0,10,12],on:18,off:34,k:7},
  dholHi:{pat:[2,4,6,8,14],on:18,off:34,k:14},
  rope:{pat:[0,4,8,12],on:24,off:33,k:9},
  sea:{pat:[0],on:28,off:32,k:1.6}};
const layerOn=(n,t)=>(t>=LAYERS[n].on&&t<LAYERS[n].off)||(t>=T.HOME&&t<T.IN);
/* seconds since the last hit of a layer (Infinity if it is not playing), and the index of that hit */
function since(n,t){if(!layerOn(n,t))return[Infinity,0];const L=LAYERS[n],bar=Math.floor(t/2),tb=t-bar*2;let best=-1;
  for(const s of L.pat)if(s*.125<=tb+1e-6)best=s;if(best<0)return[tb+2-L.pat[L.pat.length-1]*.125,(bar-1)*16+L.pat[L.pat.length-1]];return[tb-best*.125,bar*16+best];}
const hit=(n,t)=>{const s=since(n,t)[0];return s===Infinity?0:Math.exp(-s*LAYERS[n].k);};
/* beads: lit when a rhythm is collected, dark in the fog, relit after the cry */
const BEAD_ON=[10,14,20,26,30],BEAD_OFF=[36,35,34,33,32];
function bead(i,t){if(t<BEAD_OFF[i])return ss(BEAD_ON[i],BEAD_ON[i]+.4,t);if(t<T.SPIKE+.2+i*.3)return 1-ss(BEAD_OFF[i],BEAD_OFF[i]+.6,t)*.92;return lerp(.08,1,ss(T.SPIKE+.2+i*.3,T.SPIKE+.45+i*.3,t));}
const strength=t=>{let s=0;for(let i=0;i<5;i++)s+=bead(i,t);return s/5;};

/* ---------- the path ---------- */
const HOUSES=[];{let x=1180,i=0;while(x<3700){const w=230+R(i)*150;HOUSES.push({x,w,h:250+R(i+9)*200,type:i%3,i});x+=w;i++;}HOUSES[HOUSES.length-1].w=3700-HOUSES[HOUSES.length-1].x;}
function roofY(x){for(const h of HOUSES)if(x<h.x+h.w){const u=cl((x-h.x)/h.w);if(h.type===0)return -h.h-90*(1-Math.abs(2*u-1));if(h.type===1)return -h.h-((u>.55&&u<.8)?74:0);return -h.h-70*u;}return -300;}
const POLES=[7000,7500,8000,8500,9000];
const ropeY=t=>-150-150*Math.cos(TAU*t/.5+PI);
const seaY=(x,t)=>90+34*Math.sin(x*.011-t*2.2)+16*Math.sin(x*.027+t*3.1)+10*Math.sin(x*.004+t*.9);
function ground(x,t){
  if(x<0)return -520;if(x<8)return lerp(-520,0,x/8);
  if(x<1150)return 0;if(x<1180)return lerp(0,roofY(1180),(x-1150)/30);
  if(x<3700)return roofY(x);if(x<3900)return lerp(roofY(3699),-200,ss(3700,3900,x));
  if(x<6300)return -200;if(x<6480)return -200+Math.min(6,Math.floor((x-6300)/30)+1)*33.34;
  if(x<6990)return 0;if(x<7000)return lerp(0,-560,(x-6990)/10);
  if(x<9000){const u=((x-7000)%500)/500;return -560+110*4*u*(1-u);}
  if(x<9010)return lerp(-560,0,(x-9000)/10);
  if(x<10470)return 0;if(x<10500)return lerp(0,-150,(x-10470)/30);
  if(x<11000){const u=(x-10500)/500;return lerp(-150,ropeY(t),Math.sin(PI*u));}
  if(x<11030)return lerp(-150,0,(x-11000)/30);
  if(x<12350)return 0;if(x<12470)return lerp(0,seaY(x,t),ss(12350,12470,x));
  if(x<14580)return seaY(x,t);if(x<14900)return lerp(seaY(x,t),-40+6*Math.sin(x*.01),ss(14580,14900,x));
  return -40+6*Math.sin(x*.01);
}
const smoothG=(x,t)=>{let s=0;for(let k=-4;k<=4;k++)s+=ground(x+k*90,t);return s/9;};
/* which colour the place under x gives */
function placeCol(x){return x<1100?COL.green:x<3780?COL.rain:x<6480?COL.train:x<9720?COL.dhol:x<11880?COL.rope:x<14580?COL.sea:COL.fog;}

/* ---------- drawing helpers ---------- */
const pl=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));};
const ci=(c,x,y,r)=>{c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);};
const ln=(c,x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
const fs=c=>{c.fill();c.stroke();};
function glowDot(c,x,y,r,col,a=1){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(.35,rgba(col,a*.4));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
/* one heartbeat as a shape, u in 0..1 */
function ecg(u){u=((u%1)+1)%1;if(u<.12)return Math.sin(u/.12*PI)*.14;if(u<.2)return 0;if(u<.24)return -(u-.2)/.04*.2;if(u<.3)return -.2+(u-.24)/.06*1.2;if(u<.36)return 1-(u-.3)/.06*1.35;if(u<.4)return -.35+(u-.36)/.04*.35;if(u<.56)return 0;if(u<.74)return Math.sin((u-.56)/.18*PI)*.22;return 0;}
/* a person in line art. angles: 0 = arm hanging, PI = straight up. fill must be set to the ground colour. */
function person(c,x,y,h,o={}){
  const hr=h*.115,by=o.bounce||0,hip=y-h*.45-by,sh=hip-h*.3,lean=o.lean||0,sx=x+lean*h*.12,hd=sh-hr*1.3,sp=o.spread===undefined?.09:o.spread,air=o.air||0;
  c.beginPath();c.moveTo(x-h*sp,y-air);c.lineTo(x-h*.05-(o.kL||0)*h*.08,(hip+y-air)/2);c.lineTo(x,hip);c.lineTo(x+h*.05+(o.kR||0)*h*.08,(hip+y-air)/2);c.lineTo(x+h*sp,y-air);c.stroke();
  const sk=o.skirt?.17:.085,sd=o.skirt?h*.16:0;c.beginPath();c.moveTo(sx-h*.095,sh);c.lineTo(sx+h*.095,sh);c.lineTo(x+h*sk,hip+sd);c.lineTo(x-h*sk,hip+sd);c.closePath();fs(c);
  const hands=[];if(o.noArms){hands.push([sx-h*.095,sh],[sx+h*.095,sh]);}else for(const k of[-1,1]){const a=(k<0?o.aL:o.aR),e=(k<0?o.eL:o.eR)||0,A=a===undefined?.25:a,ux=sx+k*h*.095,Ln=h*.17,ex=ux+k*Math.sin(A)*Ln,ey=sh+Math.cos(A)*Ln,hx=ex+k*Math.sin(A+e)*Ln,hy=ey+Math.cos(A+e)*Ln;c.beginPath();c.moveTo(ux,sh);c.lineTo(ex,ey);c.lineTo(hx,hy);c.stroke();hands.push([hx,hy]);}
  ci(c,sx+lean*h*.04,hd,hr);fs(c);
  if(o.hair==='pony'){c.beginPath();c.moveTo(sx-hr*.7,hd-hr*.6);c.quadraticCurveTo(sx-hr*2.4,hd-hr*.4-by*.6,sx-hr*1.9,hd+hr*1.5-by);c.stroke();}
  if(o.hair==='turban'){c.beginPath();c.ellipse(sx,hd-hr*.55,hr*1.3,hr*.8,0,PI,TAU);c.closePath();fs(c);}
  if(o.hair==='bun'){ci(c,sx-hr*.2,hd-hr*1.25,hr*.5);fs(c);}
  return hands;
}
