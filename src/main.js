'use strict';
/* PULSE - the line, the world shot, the hospital room, the title, and renderAt(t). */
const LAYER_OF=['rain','train','dholLo','rope','sea'];
function lineCol(t){const st=strength(t),fogk=ss(T.FOG+.4,37.5,t)*(1-ss(T.SPIKE,T.SPIKE+.25,t)),home=ss(T.SPIKE,T.HOME,t);
  const p=hex(COL.green),q=hex(COL.gold),f=hex(COL.fog);let r=[0,1,2].map(i=>lerp(p[i],q[i],st));r=r.map((v,i)=>lerp(v,f[i],fogk));r=r.map(v=>lerp(v,255,home*.35));
  return{rgb:r.map(Math.round).join(','),fogk,st};}
function hero(c,t,x0,x1){
  const hx=HX,ret=t>=T.SPIKE+.6,dir=ret?-1:1,L=lineCol(t),amp=(18+74*L.st)*(1-L.fogk*.96),Lp=470;
  const yAt=x=>{const d=(hx-x)*dir;let y=ground(x,t);if(d>=0&&d<Lp){const env=ss(0,70,d)*(1-ss(Lp*.45,Lp,d));y-=amp*env*ecg(d/200-t*2.4);}return y;};
  const xa=Math.max(x0,-170),xb=Math.min(x1,t<38?hx:XSTOP);if(xb<=xa)return;
  c.save();c.lineJoin='round';c.lineCap='round';
  c.beginPath();for(let x=xa;x<=xb;x+=6)x===xa?c.moveTo(x,yAt(x)):c.lineTo(x,yAt(x));c.lineTo(xb,yAt(xb));
  c.strokeStyle=`rgba(${L.rgb},${.5-L.fogk*.15})`;c.lineWidth=lerp(4.5,2.5,L.fogk);c.stroke();
  const a=ret?hx:hx-Lp-160,b=ret?hx+Lp+160:hx,g=c.createLinearGradient(a,0,b,0);
  if(ret){g.addColorStop(0,'#fff');g.addColorStop(.25,`rgba(${L.rgb},1)`);g.addColorStop(1,`rgba(${L.rgb},0)`);}else{g.addColorStop(0,`rgba(${L.rgb},0)`);g.addColorStop(.75,`rgba(${L.rgb},1)`);g.addColorStop(1,'#fff');}
  c.beginPath();const s0=Math.max(xa,a),s1=Math.min(xb,b);for(let x=s0;x<=s1;x+=5)x===s0?c.moveTo(x,yAt(x)):c.lineTo(x,yAt(x));if(!ret)c.lineTo(hx,yAt(hx));
  c.strokeStyle=g;c.lineWidth=lerp(8,3.5,L.fogk);c.shadowColor=`rgba(${L.rgb},1)`;c.shadowBlur=lerp(26,6,L.fogk);c.stroke();c.stroke();
  const hy=yAt(hx),k=t>=T.SPIKE?Math.exp(-(t-T.SPIKE)*4.2):0;
  if(k>.02){c.beginPath();c.moveTo(hx-70,hy);c.lineTo(hx-26,hy+110*k);c.lineTo(hx,hy-700*k);c.lineTo(hx+24,hy+190*k);c.lineTo(hx+66,hy);c.strokeStyle='#fff';c.lineWidth=9;c.shadowBlur=40;c.stroke();}
  c.shadowBlur=0;
  for(let i=0;i<5;i++){const bx=hx-dir*(74+i*50);if(bx>xb+2&&!ret)continue;const by=yAt(bx),lv=bead(i,t);if(lv<=0)continue;const pulse=hit(LAYER_OF[i],t)+(i===2?hit('dholHi',t)*.5:0);
    glowDot(c,bx,by,54+pulse*40,BEADS[i],.5*lv);ci(c,bx,by,(9+pulse*6)*(.6+.4*lv));c.fillStyle=rgba(BEADS[i],.2+.8*lv);c.fill();c.strokeStyle=rgba('#ffffff',.7*lv);c.lineWidth=2;c.stroke();}
  glowDot(c,hx,hy,lerp(110,34,L.fogk),'#ffffff',lerp(.5,.25,L.fogk));glowDot(c,hx,hy,lerp(200,50,L.fogk),'#'+L.rgb.split(',').map(v=>(+v).toString(16).padStart(2,'0')).join(''),lerp(.35,.1,L.fogk));
  ci(c,hx,hy,lerp(11,6,L.fogk));c.fillStyle='#fff';c.fill();
  if(L.fogk<.5)for(let i=0;i<7;i++){const f=(t*2.2+R(i))%1;ci(c,hx-dir*f*150+(R(i+3)-.5)*20,hy-(R(i+5)-.5)*70*f-f*20,3*(1-f));c.fillStyle=`rgba(${L.rgb},${1-f})`;c.fill();}
  c.restore();
}
/* ---------- the world shot (5 s to 47 s) ---------- */
const Z=SQ?1.22:1.5,BY=SQ?700:1300;
function drawArt(c,t,x0,x1){
  if(x0<1250)artStreet(c,t);
  if(x1>1100&&x0<3850)artRoofs(c,t,x0,x1);
  if(x1>3780&&x0<6600)artViaduct(c,t,x0,x1);
  if(x1>6400&&x0<9800)artWedding(c,t,x0,x1);
  if(x1>9650&&x0<11950)artAlley(c,t,x0,x1);
  if(x1>11800&&x0<14900)artSea(c,t,x0,x1);
  if(x1>14500)artSnow(c,t,x0,x1);
}
function world(c,t){
  HX=headX(t);const sym=t>=T.SPIKE+.6,hsx=lerp(620,470,ss(39.6,41,t)),push=ss(46,47,t),camY=.55*smoothG(HX,t),x0=HX-hsx/Z-80,x1=HX+(W-hsx)/Z+80,L=lineCol(t);
  c.fillStyle=BG;c.fillRect(0,0,W,H);farLayer(c,t,HX*Z-hsx);
  if(t>=T.HOME&&t<46){const g=c.createRadialGradient(hsx,BY-100,0,hsx,BY-100,1100);g.addColorStop(0,rgba(placeCol(HX),.13));g.addColorStop(1,rgba(placeCol(HX),0));c.fillStyle=g;c.fillRect(0,0,W,H);}
  c.save();
  if(push>0){const z=1+.5*eo(push);c.translate(hsx,BY*.43);c.scale(z,z);c.translate(-hsx,-BY*.43);}
  c.translate(hsx,BY);c.scale(Z,Z);c.translate(-HX,-camY);c.lineCap='round';c.lineJoin='round';
  /* line art is bright where the line is, a blue trace behind it, and only a hint ahead of it */
  const pc=mixc(placeCol(HX),'#9aa3b8',L.fogk),tr='rgba(74,98,184,.95)',ah='rgba(60,80,150,.42)';let g;
  if(sym){g=c.createLinearGradient(HX-760,0,HX+760,0);g.addColorStop(0,tr);g.addColorStop(.38,pc);g.addColorStop(.5,'#ffffff');g.addColorStop(.62,pc);g.addColorStop(1,tr);}
  else{g=c.createLinearGradient(HX-760,0,HX+170,0);g.addColorStop(0,tr);g.addColorStop(.7,pc);g.addColorStop(.817,mixc('#ffffff','#9aa3b8',L.fogk));g.addColorStop(1,ah);}
  c.strokeStyle=g;c.fillStyle=BG;
  if(HX<11800||HX>14800){c.save();c.translate(0,52);c.scale(1,-1);c.globalAlpha=.17;drawArt(c,t,x0,x1);c.restore();}
  drawArt(c,t,x0,x1);fxRain(c,t,x0,x1);
  if(x1>3000&&x0<6700&&(t<22||t>T.HOME))artTrain(c,t,x0,x1);
  if(x1>16000)artFarHouse(c,t);
  hero(c,t,x0,x1);
  c.restore();
  /* snow, fog and speed lines live on the screen */
  const zone=ss(14500,15300,HX);
  if(zone>0){for(let i=0;i<90;i++){const x=((R(i)*1300-t*(30+R(i+2)*50)-HX*.6)%1300+1300)%1300-100,y=(R(i+4)*(H+80)+t*(60+R(i+6)*70))%(H+80)-40;ci(c,x,y,1.5+R(i+8)*3);c.fillStyle=`rgba(220,228,245,${(.25+R(i+9)*.45)*zone})`;c.fill();}
    for(let k=0;k<4;k++){const y=(900+k*210)*H/1920+Math.sin(t*.3+k)*40,gg=c.createLinearGradient(0,y-150,0,y+150);gg.addColorStop(0,'rgba(150,160,190,0)');gg.addColorStop(.5,`rgba(150,160,190,${.11*zone})`);gg.addColorStop(1,'rgba(150,160,190,0)');c.fillStyle=gg;c.fillRect(0,y-150,W,300);}}
  if(t>=T.HOME&&t<46){c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=3;for(let i=0;i<34;i++){const y=R(i*3)*H,x=((R(i)*1600+t*2600*(0.6+R(i+5)))%1600)-200,l=120+R(i+7)*300;ln(c,x,y,x+l,y);}}
}
/* ---------- the hospital room ---------- */
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
const WPATH=[[518,540],[590,548],[640,600],[676,700],[720,716],[800,660],[880,560],[962,470]];
function along(P,u){u=cl(u);const n=P.length-1,i=Math.min(n-1,Math.floor(u*n)),f=u*n-i;return[lerp(P[i][0],P[i+1][0],f),lerp(P[i][1],P[i+1][1],f)];}
const BEEPS_A=[.5,1.5,2.7],BEEPS_B=[49.5,50.5,51.5,52.5];
function roomBeat(t){let e=0;for(const b of(t<10?BEEPS_A:BEEPS_B))if(t>=b)e=Math.max(e,Math.exp(-(t-b)*6));return e;}
function room(c,t){
  const late=t>=T.ROOM,D=late?ss(T.BEEP+.6,T.BEEP+3,t):0,beat=roomBeat(t),wake=ss(51,51.6,t),sq=ss(50,50.5,t);
  const ink=mixc('#42589e','#3a2220',D),N=(a,b)=>mixc(a,b,D);
  c.save();if(SQ){c.translate(540,540);c.scale(.775,.775);c.translate(-540,-890);}else{c.translate(540,1000);c.scale(1.03,1.03);c.translate(-540,-1000);}if(late){const z=1+.2*eo((t-50)/3)*ss(50,50.05,t);c.translate(560,1250);c.scale(z,z);c.translate(-560,-1250);}
  c.fillStyle=N('#0a1022','#f3bd92');c.fillRect(-700,-700,2500,3400);c.fillStyle=N('#070b18','#c98a68');c.fillRect(-700,1560,2500,1500);
  c.strokeStyle=ink;c.lineWidth=5;c.lineCap='round';c.lineJoin='round';ln(c,-700,1560,1800,1560);
  /* window */
  c.save();c.beginPath();c.rect(640,250,320,470);c.clip();let g=c.createLinearGradient(0,250,0,720);g.addColorStop(0,'#0b1634');g.addColorStop(1,'#1b2f66');c.fillStyle=g;c.fillRect(640,250,320,470);
  if(D>0){g=c.createLinearGradient(0,250,0,720);g.addColorStop(0,`rgba(255,214,150,${D})`);g.addColorStop(1,`rgba(255,150,116,${D})`);c.fillStyle=g;c.fillRect(640,250,320,470);ci(c,800,760-290*D,72);c.fillStyle=`rgba(255,246,206,${D})`;c.fill();}
  ci(c,790,380,42);c.fillStyle=`rgba(226,234,255,${.9*(1-D)})`;c.fill();for(let i=0;i<14;i++){ci(c,650+R(i)*300,260+R(i+3)*300,1.6);c.fillStyle=`rgba(220,230,255,${.7*(1-D)})`;c.fill();}
  c.fillStyle=N('#060a16','#b8625a');c.beginPath();c.moveTo(640,720);for(let i=0;i<=8;i++){const x=640+i*40,h=30+R(i+20)*70;c.lineTo(x,720-h);c.lineTo(x+40,720-h);}c.lineTo(960,720);c.fill();c.restore();
  c.beginPath();c.rect(640,250,320,470);c.stroke();ln(c,800,250,800,720);ln(c,640,485,960,485);c.beginPath();c.rect(618,720,364,24);c.fillStyle=N('#0e1730','#fbe6cb');fs(c);
  for(const k of[-1,1]){const x=k<0?600:1000;c.beginPath();c.moveTo(x-k*30,224);c.lineTo(x+k*46,224);c.quadraticCurveTo(x+k*28,480,x+k*52,790);c.lineTo(x-k*20,790);c.quadraticCurveTo(x-k*46,500,x-k*30,224);c.closePath();c.fillStyle=N('#0e1730','#fff0d8');fs(c);c.lineWidth=2;ln(c,x+k*6,240,x+k*14,780);c.lineWidth=5;}
  ln(c,560,224,1040,224);
  if(D>0){c.fillStyle=`rgba(255,238,196,${.22*D})`;pl(c,[[640,250],[960,250],[1300,1560],[150,1560]]);c.fill();}
  /* monitor */
  ln(c,325,700,325,1560);ln(c,255,1560,395,1560);rr(c,110,380,430,320,26);c.fillStyle=N('#0c1328','#e6ded0');fs(c);rr(c,132,402,386,236,12);c.fillStyle='#04120d';fs(c);
  for(let k=0;k<4;k++){ci(c,170+k*40,670,9);c.stroke();}
  monitor(c,t,beat,D);
  /* drip stand, side table */
  ln(c,600,1560,600,812);ln(c,566,812,634,812);ln(c,560,1560,640,1560);rr(c,568,830,64,104,14);c.fillStyle=N('#0d1630','#e8f3f6');fs(c);c.lineWidth=2;c.beginPath();c.moveTo(600,934);c.bezierCurveTo(600,1080,520,1120,600,1236);c.stroke();c.lineWidth=5;
  /* bed */
  rr(c,54,1010,48,420,16);c.fillStyle=N('#0b1228','#a8704e');fs(c);c.beginPath();c.rect(100,1292,822,128);c.fillStyle=N('#0b1228','#ece4d8');fs(c);ln(c,120,1420,120,1560);ln(c,900,1420,900,1560);
  rr(c,112,1198,236,98,44);c.fillStyle=N('#101a38','#ffffff');fs(c);
  const skin=N('#0f1936','#e7b08a');
  c.beginPath();c.ellipse(240,1180,68,56,0,0,TAU);c.fillStyle=skin;fs(c);pl(c,[[296,1150],[322,1148],[304,1174]]);c.fillStyle=skin;fs(c);
  c.lineWidth=4;c.beginPath();c.arc(272,1166,13,.15*PI,.85*PI);c.stroke();c.beginPath();c.arc(196,1150,62,PI*.95,PI*1.75);c.stroke();
  c.strokeStyle=N('#5a70b8','#ffffff');c.lineWidth=7;c.beginPath();c.moveTo(300,1188);c.quadraticCurveTo(282,1204,262,1196);c.stroke();c.beginPath();c.moveTo(296,1206);c.quadraticCurveTo(270,1236,238,1226);c.stroke();c.strokeStyle=ink;c.lineWidth=5;
  if(D>.5){c.lineWidth=3;c.beginPath();c.arc(292,1196,9,.1*PI,.7*PI);c.stroke();c.lineWidth=5;}
  c.beginPath();c.moveTo(318,1296);c.quadraticCurveTo(350,1206,470,1214);c.lineTo(850,1236);c.quadraticCurveTo(916,1246,922,1300);c.lineTo(922,1420);c.lineTo(318,1420);c.closePath();c.fillStyle=N('#0d1630','#7fb8c8');fs(c);
  c.lineWidth=2;for(let k=0;k<5;k++){c.beginPath();c.moveTo(380+k*100,1232+k*4);c.quadraticCurveTo(396+k*100,1320,372+k*100,1418);c.stroke();}c.lineWidth=5;
  pl(c,[[556,1222],[764,1238],[764,1264],[556,1256]]);c.closePath();c.fillStyle=N('#0d1630','#f4f0e6');fs(c);
  c.beginPath();c.ellipse(784,1252,36,21,0,0,TAU);c.fillStyle=skin;fs(c);
  /* the girl */
  ln(c,896,1422,1016,1422);ln(c,908,1422,900,1560);ln(c,1004,1422,1012,1560);
  ln(c,934,1420,926,1520);ln(c,982,1420,990,1520);c.beginPath();c.ellipse(918,1526,20,9,0,0,TAU);fs(c);c.beginPath();c.ellipse(996,1526,20,9,0,0,TAU);fs(c);
  const hy=-52*wake,hxo=10*wake;
  pl(c,[[898,1422],[1014,1422],[992,1306],[944,1262+hy*.5],[884,1280+hy*.4]]);c.closePath();c.fillStyle=N('#101a38','#e2483e');fs(c);
  c.lineWidth=16;c.strokeStyle=N('#101a38','#e2483e');ln(c,900,1290+hy*.3,822,1254);c.lineWidth=5;c.strokeStyle=ink;
  c.beginPath();c.ellipse(812,1250,25,16,0,0,TAU);c.fillStyle=N('#131f44','#f0c09c');fs(c);
  c.lineWidth=4;for(let k=0;k<4;k++){c.beginPath();c.moveTo(796+k*9,1240);c.quadraticCurveTo(804+k*9,1232-sq*4,810+k*9-sq*6,1244+sq*14);c.stroke();}c.lineWidth=5;
  c.save();c.translate(872+hxo,1226+hy);c.rotate(lerp(.5,.05,wake));
  for(const k of[-1,1]){ci(c,k*56,-30,20);c.fillStyle=N('#080c1c','#2e1c14');fs(c);}
  c.beginPath();c.ellipse(0,0,58,52,0,0,TAU);c.fillStyle=N('#131f44','#f0c09c');fs(c);c.beginPath();c.ellipse(0,-14,60,44,0,PI,TAU);c.closePath();c.fillStyle=N('#080c1c','#2e1c14');fs(c);
  c.lineWidth=4;if(wake<.5){c.beginPath();c.arc(-22,10,10,.1*PI,.9*PI);c.stroke();c.beginPath();c.arc(20,10,10,.1*PI,.9*PI);c.stroke();}
  else{for(const ex of[-22,20]){ci(c,ex,10,7);c.fillStyle=N('#42589e','#2a1a14');c.fill();ci(c,ex+2,8,2.2);c.fillStyle='#fff';c.fill();}c.beginPath();c.arc(0,24,14,.15*PI,.85*PI);c.stroke();}
  c.restore();c.lineWidth=5;
  /* flowers by the window */
  c.beginPath();c.rect(966,744,60,0);for(const[fx,col]of[[986,'#ff6f7d'],[1010,'#ffd166'],[962,'#ffffff']]){c.lineWidth=3;ln(c,fx,744,fx+(fx-986)*.4,690);ci(c,fx+(fx-986)*.4,680,13);c.fillStyle=N('#0e1730',col);fs(c);}c.lineWidth=5;
  if(D<1)glowDot(c,325,520,620,COL.green,(.07+.2*beat)*(1-D));
  c.restore();
}
function monitor(c,t,beat,D){
  const mid=540,late=t>=T.ROOM,col=late?COL.gold:COL.green;
  c.save();rr(c,132,402,386,236,12);c.clip();c.strokeStyle='rgba(77,255,160,.10)';c.lineWidth=1.5;for(let x=132;x<520;x+=32)ln(c,x,402,x,638);for(let y=402;y<640;y+=32)ln(c,132,y,518,y);
  const bumps=[];
  if(!late){BEEPS_A.forEach((b,i)=>{if(t<b)return;const x=518-(Math.min(t,T.flat)-b)*110;if(i<2)bumps.push([x,1-ss(T.flat,T.flat+.7,t),1]);else{const wob=t>T.stir?1+.35*Math.sin(t*34)*ss(T.stir,T.stir+.2,t):1,xs=lerp(x,560,ss(T.slide,T.out,t));bumps.push([xs,1,wob*(t<1e9?1:1)]);}});}
  else BEEPS_B.forEach(b=>{if(t>=b)bumps.push([518-(t-b)*110,1,1]);});
  c.beginPath();for(let x=132;x<=520;x+=3){let y=0;for(const[bx,a,k]of bumps){const u=(x-(bx-56))/112;if(u>0&&u<1)y+=ecg(u*.62+.1)*a*k;}x===132?c.moveTo(x,mid-y*84):c.lineTo(x,mid-y*84);}
  if(!late||t>=T.IN){c.strokeStyle=col;c.lineWidth=4.5;c.shadowColor=col;c.shadowBlur=14;c.stroke();c.stroke();}
  c.restore();
  /* heart icon */
  c.save();c.translate(478,436);const s=1+.35*beat;c.scale(s,s);c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-22,-8,-12,-24,0,-10);c.bezierCurveTo(12,-24,22,-8,0,10);c.closePath();const alive=(!late&&t<T.flat)||(late&&t>=T.BEEP);
  if(alive){c.fillStyle=late?COL.gold:COL.green;c.fill();}else{c.strokeStyle='rgba(77,255,160,.5)';c.lineWidth=2;c.stroke();}c.restore();
  /* the blip leaves by the window, and comes back with its beads */
  let u=-1,rev=false;if(!late&&t>=T.out)u=(t-T.out)/(T.EXT-T.out);else if(late&&t<T.IN){u=1-(t-T.ROOM)/(T.IN-T.ROOM);rev=true;}
  const keep=late?1-ss(T.IN+.6,T.BEEP-.4,t):1;
  if(u>=0||(late&&keep>0)){const uu=u<0?0:u;c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();const a=rev?uu:0,b=rev?1:uu;for(let k=0;k<=40;k++){const p=along(WPATH,lerp(a,b,k/40));k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}
    c.strokeStyle=rgba(col,keep);c.lineWidth=5;c.shadowColor=col;c.shadowBlur=18;c.stroke();c.restore();
    if(u>=0){const p=along(WPATH,uu);if(rev)for(let i=0;i<5;i++){const q=along(WPATH,cl(uu+.07*(i+1)));glowDot(c,q[0],q[1],40,BEADS[i],.6);ci(c,q[0],q[1],8);c.fillStyle=BEADS[i];c.fill();}
      glowDot(c,p[0],p[1],90,col,.6);ci(c,p[0],p[1],10);c.fillStyle='#fff';c.fill();}}
  if(late&&t>=T.IN&&t<T.IN+.5)glowDot(c,325,520,700,COL.gold,.5*(1-(t-T.IN)/.5));
  if(late&&D<1)glowDot(c,325,520,620,COL.gold,.3*roomBeat(t)*(1-D));
}
/* ---------- the title ---------- */
/* the trace beats once, then the pen writes the five letters and runs on */
const TP=(()=>{const h=210,w=96,L=(x,pts)=>pts.map(q=>[x+q[0]*w,q[1]*h]);
  const S=[[[40,0],[150,0],[170,18],[195,-250],[222,70],[240,0],[278,0]],
    L(322,[[0,0],[0,-1],[1,-1],[1,-.5],[0,-.5]]),L(462,[[0,-1],[0,0],[1,0],[1,-1]]),L(602,[[0,-1],[0,0],[.85,0]]),
    L(722,[[1,-1],[0,-1],[0,-.5],[1,-.5],[1,0],[0,0]]),L(862,[[1,-1],[0,-1],[0,0],[1,0]]),L(862,[[0,-.5],[.8,-.5]]),[[990,0],[1045,0]]];
  const len=S.map(P=>{let l=0;for(let i=1;i<P.length;i++)l+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return l;});return{S,len,total:len.reduce((x,y)=>x+y,0)};})();
function title(c,t){
  c.fillStyle='#04100c';c.fillRect(0,0,W,H);c.strokeStyle='rgba(77,255,160,.07)';c.lineWidth=1.5;for(let x=0;x<W;x+=54)ln(c,x,0,x,H);for(let y=0;y<H;y+=54)ln(c,0,y,W,y);
  const p=cl((t-T.TITLE-.1)/1.6),d=p*TP.total,by=SQ?600:1010,last=Math.exp(-Math.max(0,t-55)*5)*(t>=55?1:0);
  c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();let tip=[TP.S[0][0][0],by],left=d;
  for(let k=0;k<TP.S.length&&left>0;k++){const P=TP.S[k];c.moveTo(P[0][0],by+P[0][1]);tip=[P[0][0],by+P[0][1]];
    for(let i=1;i<P.length&&left>0;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]),f=Math.min(1,left/l);tip=[lerp(P[i-1][0],P[i][0],f),by+lerp(P[i-1][1],P[i][1],f)];c.lineTo(tip[0],tip[1]);left-=l;}}
  c.strokeStyle=COL.gold;c.lineWidth=9+last*5;c.shadowColor=COL.gold;c.shadowBlur=26+last*40;c.stroke();c.stroke();c.strokeStyle='#fff7dc';c.lineWidth=3;c.shadowBlur=0;c.stroke();c.restore();
  if(p<1){glowDot(c,tip[0],tip[1],110,COL.gold,.7);ci(c,tip[0],tip[1],10);c.fillStyle='#fff';c.fill();}
  for(let i=0;i<5;i++){const a=ss(54.7+i*.08,55+i*.08,t),x=380+i*80;if(a>0){glowDot(c,x,by+150,44,BEADS[i],.5*a);ci(c,x,by+150,9+last*4);c.fillStyle=rgba(BEADS[i],a);c.fill();}}
  if(last>0)glowDot(c,540,by-100,1200,COL.gold,.18*last);
}
/* ---------- frame ---------- */
const GRAIN=(()=>{const g=document.createElement('canvas');g.width=270;g.height=480;const x=g.getContext('2d'),d=x.createImageData(270,480);for(let i=0;i<d.data.length;i+=4){const v=R(i*.37)*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}x.putImageData(d,0,0);return g;})();
function drawFrame(t,X){
  t=cl(t,0,TOTAL-.0001);X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.shadowBlur=0;X.clearRect(0,0,W,H);
  X.save();
  let sh=0;for(const[t0,a]of[[T.SPIKE,16],[T.BEEP,12],[T.IN,10]])if(t>=t0&&t<t0+.42)sh=Math.max(sh,a*(1-(t-t0)/.42));
  if(t>18&&t<T.FOG)sh=Math.max(sh,5*hit('dholLo',t));if(t>=T.HOME&&t<T.ROOM)sh=Math.max(sh,6*hit('dholLo',t));
  if(sh>0){const f=Math.floor(t*24);X.translate((R(f)-.5)*2*sh,(R(f+9)-.5)*2*sh);}
  if(t<T.EXT||(t>=T.ROOM&&t<T.TITLE))room(X,t);else if(t<T.ROOM)world(X,t);else title(X,t);
  X.restore();X.shadowBlur=0;
  /* impact frames: one inverted, one gold, one white */
  for(const t0 of[T.SPIKE,T.BEEP]){const f=Math.floor((t-t0)*24+1e-6);if(t>=t0&&f===0){X.globalCompositeOperation='difference';X.fillStyle='#fff';X.fillRect(0,0,W,H);X.globalCompositeOperation='source-over';}
    else if(t>=t0&&f===1){X.fillStyle=rgba(COL.gold,.86);X.fillRect(0,0,W,H);}else if(t>=t0&&f===2){X.fillStyle='rgba(255,255,255,.9)';X.fillRect(0,0,W,H);}}
  const f=Math.floor(t*12);X.globalAlpha=.06;X.globalCompositeOperation='overlay';X.drawImage(GRAIN,-R(f)*60,-R(f+5)*60,W+80,H+80);X.globalCompositeOperation='source-over';X.globalAlpha=1;
  const v=X.createRadialGradient(W/2,H*.5,H*.36,W/2,H*.5,H*.76);v.addColorStop(0,'rgba(0,0,10,0)');v.addColorStop(1,'rgba(0,0,10,.42)');X.fillStyle=v;X.fillRect(0,0,W,H);
  const fi=Math.min(t/.3,(TOTAL-t)/.5,1);if(fi<1){X.fillStyle=`rgba(2,3,8,${1-fi})`;X.fillRect(0,0,W,H);}
}
