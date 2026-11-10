'use strict';
/* PULSE - the places the line runs through. Every function draws line art with the current stroke style
   (a gradient that is bright near the head of the line) and fills with the ground colour only to hide what is behind. */
let HX=0;                      // world x of the head of the line, set every frame
const warm=(c,a)=>{c.save();c.fillStyle=`rgba(255,200,120,${a})`;c.fill();c.restore();};
const q12=t=>Math.floor(t*12)/12;   // people move on twos

/* ---------- far layer: skyline, moon, clouds (screen space, slow parallax) ---------- */
function farLayer(c,t,camX){
  for(let i=0;i<70;i++){const x=R(i*3+1)*W,y=R(i*7+2)*H*.47,tw=.5+.5*Math.sin(t*(1+R(i)*2)+i);ci(c,x,y,1+R(i+5)*1.6);c.fillStyle=`rgba(200,214,255,${.25+.45*tw})`;c.fill();}
  c.strokeStyle=rgba('#8fa2e6',.5);c.lineWidth=3;const my=SQ?190:330;ci(c,830,my,74);c.stroke();c.lineWidth=2;for(const[dx,dy,r]of[[-26,-20,13],[24,6,19],[-10,34,9],[30,-34,7]]){ci(c,830+dx,my+dy,r);c.stroke();}
  c.lineWidth=2.5;for(let k=0;k<3;k++){const x=((k*460+t*(6+k*3)-camX*.05)%1500+1500)%1500-200,y=(220+k*170)*(SQ?.6:1);c.beginPath();c.moveTo(x,y);c.arc(x+40,y,40,PI,0);c.arc(x+110,y-8,54,PI,0);c.arc(x+180,y,36,PI,0);c.lineTo(x,y);c.stroke();}
  const p=.22,off=camX*p,hy=BY-210;c.save();c.translate(-off,0);c.strokeStyle=rgba(COL.trace,.75);c.fillStyle=BG;c.lineWidth=2.5;
  for(let fx=Math.floor((off-100)/46)*46;fx<off+W+100;fx+=46){const wx=fx/p,i=Math.round(fx/46);
    if(wx<11600){const h=50+R(i*3)*190*(wx>9700?.6:1);c.beginPath();c.rect(fx,hy-h,46,h+40);fs(c);
      if(R(i*5)<.5){c.save();c.fillStyle='rgba(255,200,120,.3)';c.fillRect(fx+10+R(i)*20,hy-h+14+R(i+2)*(h*.6),6,8);c.restore();}
      if(i%23===7){c.beginPath();c.arc(fx+23,hy-h,30,PI,0);fs(c);ln(c,fx+23,hy-h-30,fx+23,hy-h-52);c.beginPath();c.rect(fx+62,hy-h-150,12,150);fs(c);ci(c,fx+68,hy-h-156,9);fs(c);}}
    else if(wx<14700){ln(c,fx,hy+6,fx+46,hy+6);if(i%17===3){c.beginPath();c.moveTo(fx,hy+6);c.quadraticCurveTo(fx+60,hy-50,fx+130,hy+6);c.stroke();}}
    else{const y0=hy-14*Math.sin(i*.4),y1=hy-14*Math.sin((i+1)*.4);ln(c,fx,y0,fx+46,y1);if(i%2){ln(c,fx+20,y0,fx+20,y0-30);ln(c,fx+8,y0-8,fx+20,y0-30);ln(c,fx+32,y0-8,fx+20,y0-30);}}}
  c.restore();
}

/* ---------- hospital front and the street ---------- */
function lamp(c,x){c.lineWidth=4;ln(c,x,0,x,-330);c.beginPath();c.moveTo(x,-330);c.quadraticCurveTo(x,-380,x+50,-380);c.stroke();c.beginPath();c.moveTo(x+36,-380);c.lineTo(x+84,-380);c.lineTo(x+72,-356);c.lineTo(x+48,-356);c.closePath();warm(c,.6);c.stroke();c.lineWidth=2;c.setLineDash([6,14]);ln(c,x+50,-350,x+6,-30);ln(c,x+70,-350,x+134,-30);c.setLineDash([]);}
function tree(c,x,y,s){c.lineWidth=4;ln(c,x,y,x,y-100*s);for(const[dx,dy,r]of[[0,-150,62],[-52,-122,44],[54,-120,46],[0,-204,42]]){ci(c,x+dx*s,y+dy*s,r*s);fs(c);}c.lineWidth=2;for(let i=0;i<7;i++){c.beginPath();c.arc(x+(R(i+x)-.5)*110*s,y-150*s+(R(i*3+x)-.5)*90*s,10*s,.2,2.4);c.stroke();}}
function artStreet(c,t){
  c.lineWidth=4;c.beginPath();c.rect(-760,-900,760,900);fs(c);ln(c,-780,-900,24,-900);ln(c,-780,-880,24,-880);
  for(let r=0;r<3;r++)for(let k=0;k<4;k++){const x=-640+k*155,y=[-840,-670,-400][r],me=r===1&&k===3;c.beginPath();c.rect(x,y,110,150);
    if(me){c.save();c.fillStyle=rgba(COL.green,.2+.08*Math.sin(t*3));c.fill();c.restore();}else if(R(r*7+k)<.4)warm(c,.25);c.stroke();c.lineWidth=2;ln(c,x+55,y,x+55,y+150);ln(c,x,y+75,x+110,y+75);c.lineWidth=4;ln(c,x-10,y+150,x+120,y+150);}
  ci(c,-350,-975,46);fs(c);c.lineWidth=9;ln(c,-350,-1000,-350,-950);ln(c,-375,-975,-325,-975);c.lineWidth=4;
  c.beginPath();c.rect(-455,-200,170,200);fs(c);ln(c,-370,-200,-370,0);pl(c,[[-480,-200],[-470,-232],[-270,-232],[-260,-200]]);c.closePath();fs(c);
  ln(c,-900,24,1150,24);lamp(c,260);lamp(c,820);tree(c,560,0,1.25);tree(c,1010,0,1);
  c.beginPath();c.rect(380,-58,130,10);fs(c);ln(c,392,-48,392,0);ln(c,498,-48,498,0);ln(c,380,-96,510,-96);ln(c,380,-96,380,-58);ln(c,510,-96,510,-58);
  ln(c,1150,0,1150,roofY(1180));c.lineWidth=2;for(let y=-40;y>roofY(1180);y-=44)ln(c,1142,y,1158,y);
}
/* ---------- rooftops in the rain ---------- */
function artRoofs(c,t,x0,x1){
  for(const h of HOUSES){if(h.x+h.w<x0||h.x>x1)continue;const x=h.x,w=h.w,i=h.i;c.lineWidth=4;
    c.beginPath();c.moveTo(x,0);for(let u=0;u<=1.0001;u+=.05)c.lineTo(x+u*w*.999,roofY(x+u*w*.999));c.lineTo(x+w,0);c.closePath();c.fill();
    ln(c,x,roofY(x+1),x,0);if(h.type!==1)ln(c,x,-h.h,x+w,-h.h);
    const cols=Math.max(1,Math.floor((w-50)/92)),rows=Math.max(1,Math.floor((h.h-70)/108));
    for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const wx=x+30+k*((w-60)/cols)+((w-60)/cols-46)/2,wy=-h.h+34+r*108;if(wy>-150&&Math.abs(wx+23-(x+w*.5))<50)continue;c.beginPath();c.rect(wx,wy,46,60);if(R(i*13+r*5+k)<.3)warm(c,.4);c.stroke();c.lineWidth=2;ln(c,wx+23,wy,wx+23,wy+60);ln(c,wx-6,wy+60,wx+52,wy+60);c.lineWidth=4;}
    c.beginPath();c.rect(x+w*.5-28,-96,56,96);c.stroke();ci(c,x+w*.5+14,-48,3);c.stroke();
    c.lineWidth=2;
    if(h.type===0)for(let u=.08;u<.95;u+=.06){const px=x+u*w,py=roofY(px);ln(c,px,py+8,px,py+26);}
    if(h.type===1){const a=x+w*.55,b=x+w*.8;ln(c,a+10,-h.h-74,a+10,-h.h);ln(c,b-10,-h.h-74,b-10,-h.h);ln(c,a,-h.h-50,b,-h.h-50);ln(c,a,-h.h-26,b,-h.h-26);}
    if(h.type===2)for(let u=.1;u<.95;u+=.08){const px=x+u*w,py=roofY(px);ln(c,px,py+8,px+4,py+24);}
    if(i%2===0){const ax=x+w*.25,ay=roofY(ax);ln(c,ax,ay,ax,ay-96);ln(c,ax-24,ay-90,ax+24,ay-90);ln(c,ax-16,ay-74,ax+16,ay-74);ln(c,ax-10,ay-58,ax+10,ay-58);}
    if(i%3===1){const y=-h.h+20;c.beginPath();c.moveTo(x+w-6,y);c.quadraticCurveTo(x+w+60,y+50,x+w+130,y+10);c.stroke();for(let k=0;k<3;k++){c.beginPath();c.rect(x+w+18+k*34,y+26+Math.sin(t*2+k)*3-k*3,22,30);c.stroke();}}
  }
  c.lineWidth=4;ln(c,1100,24,3800,24);
}
function fxRain(c,t,x0,x1){
  if(x1<1050||x0>4000)return;c.save();c.strokeStyle=rgba(COL.rain,.5);c.lineWidth=2.5;
  for(let tile=Math.floor(x0/1400);tile<=Math.floor(x1/1400);tile++)for(let i=0;i<120;i++){const px=tile*1400+R(i+tile*31)*1400;if(px<1050||px>3950||px>HX+150)continue;const f=(t*(1.2+R(i+3)*.7)+R(i+7))%1,py=-1250+f*1300,g=ground(px,t);if(py<g-6)ln(c,px,py,px-9,Math.min(py+40,g-2));}
  const[s,idx]=since('rain',t);if(s<.32){c.strokeStyle=rgba(COL.rain,1-s/.32);c.shadowColor=COL.rain;c.shadowBlur=14;c.lineWidth=3;for(let j=0;j<4;j++){const sx=HX-440+R(idx*3+j)*560;if(sx<1180||sx>3700)continue;const sy=ground(sx,t),r=8+s*110;c.beginPath();c.ellipse(sx,sy,r,r*.3,0,PI,TAU);c.stroke();for(const a of[-1,-.3,.3,1])ln(c,sx+a*10,sy-6,sx+a*(18+s*90),sy-14-s*120*(1-Math.abs(a)*.5));}}
  c.restore();
}
/* ---------- the viaduct and the steam train ---------- */
function artViaduct(c,t,x0,x1){
  c.lineWidth=4;
  for(let ax=3900;ax<6300;ax+=300){if(ax+300<x0||ax>x1)continue;c.beginPath();c.rect(ax,-186,300,186);c.fill();ln(c,ax,-186,ax+300,-186);
    c.beginPath();c.moveTo(ax+60,0);c.lineTo(ax+60,-60);c.arc(ax+180,-60,120,PI,0);c.lineTo(ax+300,0);c.stroke();c.lineWidth=2;c.beginPath();c.arc(ax+180,-60,136,PI*1.08,PI*1.92);c.stroke();
    for(let k=0;k<7;k++){const bx=ax+8+R(ax+k)*44,by=-20-R(ax+k*3)*150;ln(c,bx,by,bx+18,by);}c.lineWidth=4;}
  c.lineWidth=2;for(let x=Math.max(3900,Math.floor(x0/40)*40);x<Math.min(6300,x1);x+=40)ln(c,x,-198,x,-188);
  for(let px=3980;px<6300;px+=450){if(px<x0-500||px>x1+50)continue;c.lineWidth=4;ln(c,px,-200,px,-560);ln(c,px-44,-540,px+44,-540);ln(c,px-30,-510,px+30,-510);c.lineWidth=2;for(const[dx,dy]of[[-40,-540],[40,-540],[-26,-510]]){c.beginPath();c.moveTo(px+dx,dy);c.quadraticCurveTo(px+dx+225,dy+46,px+dx+450,dy);c.stroke();}}
  c.lineWidth=4;ln(c,5300,-200,5300,-430);c.beginPath();c.rect(5282,-520,36,90);fs(c);ci(c,5300,-498,11);c.stroke();ci(c,5300,-462,11);c.save();c.fillStyle=rgba(COL.train,.9);c.fill();c.restore();c.stroke();
  pl(c,[[6300,-200],[6480,0]]);c.stroke();ln(c,6300,-270,6480,-70);for(let k=0;k<4;k++)ln(c,6300+k*60,-200+k*66,6300+k*60,-270+k*66);
  ln(c,3780,24,6300,24);ln(c,6240,-200,6240,-240);ln(c,6222,-240,6258,-240);
}
const trainX=t=>t<22?Math.min(6200,headX(t)-700+(t-12.4)*260):6200;
function wheel(c,x,y,r,ang){ci(c,x,y,r);fs(c);c.save();c.lineWidth=2;for(let k=0;k<4;k++){const a=ang+k*PI/4;ln(c,x-Math.cos(a)*r,y-Math.sin(a)*r,x+Math.cos(a)*r,y+Math.sin(a)*r);}c.restore();ci(c,x,y,r*.22);fs(c);}
function artTrain(c,t,x0,x1){
  const tx=trainX(t);if(tx<x0-100||tx-1900>x1)return;const y0=-200,by=y0-40,ang=tx/34;c.save();c.strokeStyle=rgba(COL.train,.9);c.fillStyle=BG;c.lineWidth=4;c.lineJoin='round';
  for(let k=0;k<6;k++){const a=(t*1.4+k/6)%1;c.globalAlpha=(1-a)*.8;ci(c,tx-96-a*300,by-196-a*220,14+a*52);c.stroke();}c.globalAlpha=1;
  pl(c,[[tx-330,by],[tx-330,by-176],[tx-236,by-176],[tx-236,by-116],[tx-60,by-116],[tx-34,by-96],[tx-34,by]]);c.closePath();fs(c);
  c.beginPath();c.rect(tx-312,by-156,58,48);warm(c,.45);c.stroke();ln(c,tx-344,by-176,tx-222,by-176);
  pl(c,[[tx-112,by-116],[tx-118,by-176],[tx-76,by-176],[tx-82,by-116]]);fs(c);ln(c,tx-124,by-176,tx-70,by-176);c.beginPath();c.arc(tx-170,by-116,22,PI,0);fs(c);
  pl(c,[[tx-34,by],[tx+18,y0-4],[tx-34,y0-4]]);c.closePath();fs(c);ci(c,tx-34,by-70,12);warm(c,.9);c.stroke();
  for(const wx of[-92,-176,-260])wheel(c,tx+wx,y0-34,34,ang);ln(c,tx-92+Math.cos(ang)*20,y0-34+Math.sin(ang)*20,tx-260+Math.cos(ang)*20,y0-34+Math.sin(ang)*20);
  for(let j=0;j<4;j++){const cx=tx-354-j*356;ln(c,cx+24,by-30,cx,by-30);c.beginPath();c.moveTo(cx-330,by);c.lineTo(cx-330,by-124);c.quadraticCurveTo(cx-165,by-150,cx,by-124);c.lineTo(cx,by);c.closePath();fs(c);
    for(let k=0;k<5;k++){c.beginPath();c.rect(cx-306+k*60,by-104,40,50);warm(c,.4);c.stroke();}ln(c,cx-330,by-40,cx,by-40);
    for(const wx of[-60,-110,-220,-270])wheel(c,cx+wx,y0-24,24,tx/24);}
  const[s]=since('train',t);if(s<.22){c.strokeStyle=rgba(COL.mari,1-s/.22);c.shadowColor=COL.train;c.shadowBlur=16;c.lineWidth=3;for(const wx of[-92,-260,-464,-624]){const px=tx+wx,py=y0;for(let k=0;k<6;k++){const a=PI+.2+R(k+wx)*1.1*(k%2?1:-1)-PI/2*0,dx=Math.cos(PI*(.15+R(k*3+wx)*.7)),dy=-Math.sin(PI*(.15+R(k*3+wx)*.7));ln(c,px+dx*(8+s*60),py+dy*(8+s*60),px+dx*(26+s*190),py+dy*(26+s*190));}}}
  c.restore();
}
/* ---------- the wedding street ---------- */
function gate(c,x){c.lineWidth=4;for(const k of[-1,1]){c.beginPath();c.rect(x+k*170-22,-380,44,380);fs(c);c.beginPath();c.rect(x+k*170-32,-400,64,20);fs(c);}c.beginPath();c.arc(x,-400,170,PI,0);c.stroke();c.beginPath();c.arc(x,-400,206,PI,0);c.stroke();c.lineWidth=2;for(let k=0;k<9;k++){const a=PI+(k+.5)*PI/9;ln(c,x+Math.cos(a)*170,-400+Math.sin(a)*170,x+Math.cos(a)*206,-400+Math.sin(a)*206);}ln(c,x,-570,x,-520);ci(c,x,-506,14);c.stroke();}
function artWedding(c,t,x0,x1){
  const lo=hit('dholLo',t),hi=hit('dholHi',t),on=layerOn('dholLo',t),tq=q12(t),b=tq/.5;
  gate(c,6740);gate(c,9400);c.lineWidth=4;ln(c,6480,24,9720,24);
  c.lineWidth=3;ln(c,7140,-410,8860,-410);for(let x=7140;x<8860;x+=86){c.beginPath();c.arc(x+43,-410,43,0,PI);c.stroke();ln(c,x,-410,x,-384);ci(c,x,-378,5);c.stroke();}ln(c,7140,-410,7140,0);ln(c,8860,-410,8860,0);
  c.lineWidth=2;for(const[a,bx,ya,yb]of[[6740,7000,-606,-590],[9000,9400,-590,-606]]){c.beginPath();c.moveTo(a,ya);c.quadraticCurveTo((a+bx)/2,ya+120,bx,yb);c.stroke();}
  c.lineWidth=4;for(const p of POLES){ln(c,p,0,p,-596);ci(c,p,-606,10);fs(c);c.beginPath();c.rect(p-16,-14,32,14);fs(c);}
  for(let x=7025;x<9000;x+=50){const y=ground(x,t)+17,k=Math.round(x/50);c.lineWidth=2;ln(c,x,y-17,x,y-9);ci(c,x,y,9);if(x<revealX(t)){c.save();c.fillStyle=rgba(k%2?COL.mari:COL.dhol,.35+.65*(on?(k%2?lo:hi):.25));c.shadowColor=k%2?COL.mari:COL.dhol;c.shadowBlur=12;c.fill();c.restore();}c.stroke();}
  c.lineWidth=4;
  [7290,7540,8320,8580,8830].forEach((x,i)=>{const h=236+R(i)*40,s=Math.sin(PI*b+i*1.3);person(c,x,0,h,on?{bounce:20*Math.abs(Math.sin(PI*b)),aL:2.5+.45*s,aR:2.5-.45*s,eL:-.6,eR:-.6,kL:s>0?1:0,kR:s>0?0:1,skirt:i%2===0,hair:i%2===0?'pony':i===3?'turban':null,lean:.15*s}:{aL:.3,aR:.3,skirt:i%2===0,hair:i%2===0?'pony':null});});
  /* the dhol player: body, then the drum slung at his hip, then his arms and sticks over it */
  const x=7930,h=430,bob=on?12*Math.abs(Math.sin(PI*b)):0,dx=x+26,dy=-h*.45-bob-6;
  const sh=person(c,x,0,h,{bounce:bob,noArms:true,hair:'turban',lean:-.1,spread:.14,kL:on&&Math.sin(PI*b)>0?1:0});
  c.lineWidth=3;ln(c,sh[0][0],sh[0][1],dx+92,dy-40);c.lineWidth=4;
  c.save();c.translate(dx,dy);c.rotate(-.16);
  c.beginPath();c.moveTo(-96,-44);c.quadraticCurveTo(0,-66,96,-44);c.lineTo(96,44);c.quadraticCurveTo(0,66,-96,44);c.closePath();fs(c);
  c.lineWidth=2;for(let k=0;k<6;k++){ln(c,-80+k*32,-50,-64+k*32,52);ln(c,-64+k*32,-50,-80+k*32,52);}c.lineWidth=4;
  c.beginPath();c.ellipse(96,0,15,45,0,0,TAU);fs(c);c.beginPath();c.ellipse(-96,0,15,45,0,0,TAU);fs(c);c.restore();
  const hr=[dx+72,dy-74-(1-lo)*30],hl=[dx-78,dy-58-(1-hi)*16];
  for(const[s0,hd,el]of[[sh[1],hr,[sh[1][0]+62,sh[1][1]+70]],[sh[0],hl,[sh[0][0]-56,sh[0][1]+74]]]){c.beginPath();c.moveTo(s0[0],s0[1]);c.lineTo(el[0],el[1]);c.lineTo(hd[0],hd[1]);c.stroke();}
  c.lineWidth=6;c.beginPath();c.moveTo(hr[0],hr[1]);c.quadraticCurveTo(dx+150,dy-70-(1-lo)*70,dx+112+(1-lo)*30,dy-14-(1-lo)*60);c.stroke();c.lineWidth=4;ln(c,hl[0],hl[1],dx-112-(1-hi)*26,dy+6-(1-hi)*56);
  c.save();c.shadowBlur=18;const[s1]=since('dholLo',t);if(s1<.4){c.shadowColor=COL.dhol;c.lineWidth=5;for(let k=0;k<3;k++){const r=30+s1*520+k*46;c.strokeStyle=rgba(k%2?COL.mari:COL.dhol,(1-s1/.4)*.9);c.beginPath();c.arc(dx+112,dy-16,r,-.8,.8);c.stroke();}}
  const[s2]=since('dholHi',t);if(s2<.2){c.strokeStyle=rgba(COL.mari,1-s2/.2);c.shadowColor=COL.mari;c.lineWidth=3;for(let k=0;k<5;k++){const a2=PI+(k-2)*.34;ln(c,dx-112+Math.cos(a2)*(20+s2*60),dy+14+Math.sin(a2)*(20+s2*60),dx-112+Math.cos(a2)*(44+s2*200),dy+14+Math.sin(a2)*(44+s2*200));}}c.restore();
  c.save();c.fillStyle=rgba(COL.mari,.8);for(let i=0;i<46;i++){const px=6600+R(i*3)*2900,f=(t*(.16+R(i)*.14)+R(i+5))%1;ci(c,px+Math.sin(t*2+i)*24,-700+f*700,4+R(i+2)*3);c.fill();}c.restore();
}
/* ---------- the alley and the skipping rope ---------- */
function artAlley(c,t,x0,x1){
  const tq=q12(t),on=layerOn('rope',t);c.lineWidth=4;
  c.beginPath();c.moveTo(9760,0);c.lineTo(9760,-560);for(let x=9760;x<=11860;x+=140)c.lineTo(x,-560-(Math.round(x/140)%3)*26);c.lineTo(11860,0);c.closePath();fs(c);ln(c,9720,24,11880,24);
  for(const dx of[9850,10240,11300,11650]){c.beginPath();c.moveTo(dx,0);c.lineTo(dx,-150);c.arc(dx+50,-150,50,PI,0);c.lineTo(dx+100,0);fs(c);ln(c,dx+50,-200,dx+50,0);ci(c,dx+40,-90,4);c.stroke();}
  for(const wx of[10040,10640,10840,11480]){c.beginPath();c.rect(wx,-430,90,110);if(R(wx)<.6)warm(c,.35);c.stroke();c.lineWidth=2;ln(c,wx+45,-430,wx+45,-320);ln(c,wx-10,-320,wx+100,-320);for(let k=0;k<4;k++)ln(c,wx+6,-420+k*26,wx+38,-420+k*26);c.lineWidth=4;}
  c.lineWidth=2;c.beginPath();c.moveTo(10330,-480);c.quadraticCurveTo(10750,-400,11170,-480);c.stroke();for(let k=0;k<12;k++){const u=(k+.5)/12,fx=10330+u*840,fy=-480+80*4*u*(1-u)*.5+Math.sin(t*3+k)*2;pl(c,[[fx-16,fy],[fx+16,fy],[fx,fy+34]]);c.closePath();c.stroke();}
  c.lineWidth=4;ci(c,9960,-44,44);c.stroke();ci(c,10090,-44,44);c.stroke();c.lineWidth=3;pl(c,[[9960,-44],[10010,-110],[10070,-110],[10090,-44]]);c.stroke();pl(c,[[10010,-110],[10030,-44],[10070,-110]]);c.stroke();ln(c,10000,-128,10022,-128);ln(c,10070,-110,10062,-140);ln(c,10046,-142,10080,-140);
  const cx=10190,cy=-560-26;c.lineWidth=4;c.beginPath();c.ellipse(cx,cy-24,44,26,0,0,TAU);fs(c);ci(c,cx+44,cy-50,20);fs(c);pl(c,[[cx+30,cy-64],[cx+34,cy-86],[cx+46,cy-70]]);c.stroke();pl(c,[[cx+48,cy-70],[cx+58,cy-86],[cx+62,cy-62]]);c.stroke();c.beginPath();c.moveTo(cx-44,cy-24);c.quadraticCurveTo(cx-90,cy-30,cx-80+Math.sin(t*2)*10,cy-84);c.stroke();
  for(const px of[11200,11256]){pl(c,[[px-20,-40],[px+20,-40],[px+14,0],[px-14,0]]);c.closePath();fs(c);c.lineWidth=3;for(const a of[-.5,0,.5]){c.beginPath();c.moveTo(px,-40);c.quadraticCurveTo(px+a*40,-80,px+a*60,-104);c.stroke();}c.lineWidth=4;}
  c.lineWidth=2;for(let k=0;k<5;k++){c.beginPath();c.rect(11400+k*46,4,44,16);c.stroke();}c.lineWidth=4;
  const th=TAU*tq/.5,air=on?76*Math.max(0,Math.cos(th)):0;
  person(c,10436,0,250,{aR:1.35+.2*Math.sin(th),eR:.2,aL:.3,hair:null,spread:.1});person(c,11064,0,250,{aL:1.35+.2*Math.sin(th),eL:.2,aR:.3,hair:'bun',skirt:true,spread:.1});
  person(c,10750,0,230,{air,skirt:true,hair:'pony',bounce:air*.4,aL:.9,aR:.9,eL:-1.4,eR:-1.4,kL:air>20?1:0,kR:air>20?1:0});
  const clap=on?Math.exp(-((tq%1)<.5?9:(tq%1-.5))*9):0;
  for(const[kx,d]of[[10300,1],[11190,-1]])person(c,kx,-30,190,d>0?{aR:1.5-clap*.3,eR:-.9,aL:1.2,eL:-1.6,kR:1,hair:'pony',skirt:true}:{aL:1.5-clap*.3,eL:-.9,aR:1.2,eR:-1.6,kL:1});
  ln(c,10250,-30,10350,-30);ln(c,11140,-30,11240,-30);
  const[s]=since('rope',t);if(s<.25){c.save();c.strokeStyle=rgba(COL.rope,1-s/.25);c.shadowColor=COL.rope;c.shadowBlur=16;c.lineWidth=4;c.beginPath();c.ellipse(10750,0,40+s*520,(40+s*520)*.14,0,PI,TAU);c.stroke();for(const a of[-1,-.5,.5,1])ln(c,10750+a*50,-4,10750+a*(70+s*260),-10-s*130);c.restore();}
}
/* ---------- the pier, the sea, the boat, the lighthouse ---------- */
function artSea(c,t,x0,x1){
  c.lineWidth=4;
  for(let px=11900;px<12360;px+=115){ln(c,px,0,px,440);ln(c,px+14,0,px+14,440);c.lineWidth=2;ln(c,px,120,px+115,260);ln(c,px+115,120,px,260);c.lineWidth=4;}
  ln(c,11880,18,12350,18);c.lineWidth=2;for(let x=11900;x<12350;x+=30)ln(c,x,0,x,18);c.lineWidth=4;lamp(c,12240);c.beginPath();c.rect(12040,-30,34,30);fs(c);ci(c,12057,-36,14);fs(c);
  c.lineWidth=2;for(let k=1;k<=4;k++){c.beginPath();for(let x=Math.max(12380,x0-40);x<Math.min(14700,x1+40);x+=24){const y=seaY(x+k*90,t*.8+k)+k*58+k*k*6;x===Math.max(12380,x0-40)?c.moveTo(x,y):c.lineTo(x,y);}c.globalAlpha=1-k*.17;c.stroke();}c.globalAlpha=1;
  for(let i=0;i<12;i++){const dir=R(i+2)>.5?1:-1,fx=12450+((R(i)*2100+t*46*dir)%2100+2100)%2100,fy=190+R(i+4)*210+Math.sin(t+i)*10,s=.7+R(i+6)*.8;c.beginPath();c.ellipse(fx,fy,30*s,12*s,0,0,TAU);c.stroke();pl(c,[[fx-dir*30*s,fy],[fx-dir*50*s,fy-12*s],[fx-dir*50*s,fy+12*s]]);c.closePath();c.stroke();ci(c,fx+dir*16*s,fy-3*s,2);c.stroke();}
  for(let x=12420;x<14600;x+=150){const hh=110+R(x)*130;c.beginPath();for(let k=0;k<=8;k++){const u=k/8;const px=x+Math.sin(t*1.4+x+u*3)*16*u,py=432-u*hh;k?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  c.lineWidth=3;c.beginPath();for(let x=12380;x<=14700;x+=60)x===12380?c.moveTo(x,438):c.lineTo(x,438-10*Math.sin(x*.02));c.stroke();
  for(let i=0;i<16;i++){const bx=12500+R(i*5)*2000,f=(t*(.14+R(i)*.1)+R(i+3))%1;ci(c,bx+Math.sin(t*3+i)*8,425-f*320,3+R(i+8)*5);c.stroke();}
  c.lineWidth=4;const bx=13330,by=seaY(bx,t),tilt=Math.atan((seaY(bx+60,t)-seaY(bx-60,t))/120)*.7;c.save();c.translate(bx,by);c.rotate(tilt);
  c.beginPath();c.moveTo(-130,-34);c.lineTo(130,-34);c.quadraticCurveTo(110,26,60,30);c.lineTo(-70,30);c.quadraticCurveTo(-112,22,-130,-34);c.closePath();fs(c);ln(c,-112,-10,112,-10);
  ln(c,0,-34,0,-300);pl(c,[[8,-290],[8,-70],[120,-70]]);c.closePath();fs(c);pl(c,[[-8,-250],[-8,-70],[-86,-70]]);c.closePath();fs(c);pl(c,[[0,-300],[30,-290],[0,-280]]);c.stroke();
  ln(c,-104,-34,-104,-84);ci(c,-104,-98,14);warm(c,.95);c.stroke();c.restore();
  const lx=14280;pl(c,[[lx-210,170],[lx-150,40],[lx-60,-10],[lx+70,-4],[lx+170,60],[lx+230,170]]);fs(c);pl(c,[[lx-52,-6],[lx-34,-420],[lx+34,-420],[lx+52,-6]]);c.closePath();fs(c);
  for(const u of[.25,.5,.75])ln(c,lx-52+18*u,-6-414*u,lx+52-18*u,-6-414*u);ln(c,lx-50,-420,lx+50,-420);c.beginPath();c.rect(lx-26,-480,52,60);warm(c,.8);c.stroke();pl(c,[[lx-36,-480],[lx,-530],[lx+36,-480]]);c.closePath();fs(c);
  c.lineWidth=2;c.setLineDash([10,16]);const sw=Math.sin(t*.9)*260;ln(c,lx-26,-456,lx-1000,-456+sw-70);ln(c,lx-26,-444,lx-1000,-444+sw+70);c.setLineDash([]);
  c.lineWidth=3;for(let i=0;i<6;i++){const gx=12600+i*330+Math.sin(t*.5+i)*60,gy=-330-R(i)*240+Math.sin(t+i)*20,f=10*Math.sin(t*7+i);pl(c,[[gx-18,gy-f],[gx,gy],[gx+18,gy-f]]);c.stroke();}
  const[s,idx]=since('sea',t);if(s<1.1){c.save();c.shadowColor=COL.sea;c.shadowBlur=16;const sx=HX-110,sy=seaY(sx,t);for(let k=0;k<14;k++){const a=-PI*(.1+R(k+idx)*.8),v=280+R(k*3+idx)*380,px=sx+Math.cos(a)*v*s,py=sy+Math.sin(a)*v*s+520*s*s;ci(c,px,py,(7-s*4)*(1-s/1.1)+1.5);c.fillStyle=rgba(k%3?COL.sea:'#ffffff',(1-s/1.1));c.fill();}
    c.strokeStyle=rgba(COL.sea,1-s/1.1);c.lineWidth=4;c.beginPath();c.ellipse(sx,sy,30+s*300,(30+s*300)*.2,0,PI,TAU);c.stroke();c.restore();}
}
/* ---------- the snow field ---------- */
function branch(c,x,y,a,l,d,t){if(d===0||l<8)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;c.lineWidth=Math.max(1.5,d*1.1);ln(c,x,y,x2,y2);branch(c,x2,y2,a-.42-R(d+x)*.2,l*.7,d-1,t);branch(c,x2,y2,a+.36+R(d*3+x)*.2,l*.66,d-1,t);}
function artSnow(c,t,x0,x1){
  c.lineWidth=4;for(const[rx,w,h]of[[14640,90,70],[14760,130,96],[14870,70,50]]){pl(c,[[rx-w,140],[rx-w*.5,140-h],[rx+w*.3,140-h*1.1],[rx+w,140]]);fs(c);}
  for(let px=14990;px<15560;px+=145){const g=ground(px,t),lean=(R(px)-.5)*14;ln(c,px,g,px+lean,g-92);c.lineWidth=2;c.beginPath();c.moveTo(px+lean,g-80);c.quadraticCurveTo(px+72,g-60,px+145+(R(px+145)-.5)*14,ground(px+145,t)-80);c.stroke();c.lineWidth=4;}
  branch(c,15720,ground(15720,t),-PI/2,150,6,t);
  const gx=15960,g=ground(gx,t);ln(c,gx,g,gx-10,g-330);ln(c,gx-46,g-300,gx+30,g-306);c.lineWidth=2;c.beginPath();c.moveTo(gx-44,g-300);c.quadraticCurveTo(gx-120,g-200,gx-150,g-40);c.stroke();
  for(let x=15050;x<15950;x+=64){const y=ground(x,t)+14;c.beginPath();c.ellipse(x,y,9,4,-.3,0,TAU);c.stroke();}
}
function artFarHouse(c,t){
  const x=16420,y=-70,lit=ss(T.CRY,T.CRY+.2,t);c.save();c.strokeStyle=rgba(COL.fog,.35+.5*lit);c.fillStyle=BG;c.lineWidth=4;
  c.beginPath();c.moveTo(16150,-40);c.quadraticCurveTo(16420,-96,16760,-40);c.stroke();
  c.beginPath();c.rect(x-80,y-112,160,112);fs(c);pl(c,[[x-100,y-112],[x,y-190],[x+100,y-112]]);c.closePath();fs(c);c.beginPath();c.rect(x+36,y-176,22,44);fs(c);
  c.beginPath();c.rect(x-50,y-84,44,48);if(lit>0){c.save();c.fillStyle=rgba(COL.warm,.95*lit);c.shadowColor=COL.warm;c.shadowBlur=40;c.fill();c.restore();}c.stroke();c.beginPath();c.rect(x+20,y-74,34,74);c.stroke();
  if(lit>0){for(let k=0;k<5;k++){const a=(t*.5+k/5)%1;c.globalAlpha=(1-a)*.7*lit;ci(c,x+47+a*40,y-190-a*150,8+a*26);c.stroke();}c.globalAlpha=1;
    c.strokeStyle=rgba(COL.warm,.9);c.lineWidth=4;for(let k=0;k<4;k++){const r=(t-T.CRY-k*.16)*560;if(r>0&&r<520){c.globalAlpha=1-r/520;c.beginPath();c.arc(x-28,y-60,r,PI-.7,PI+.7);c.stroke();}}c.globalAlpha=1;}
  c.restore();
}
