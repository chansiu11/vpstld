/* Original procedural pixel art. No third-party game assets are bundled. */
(() => {
"use strict";
const WIDTH=384, HEIGHT=216, GROUND=174, FULL=1920, LEFT=-960;
const cache=new Map();
function R(c,x,y,w,h,color){if(w<=0||h<=0)return;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function random(seed){return function(){seed=(Math.imul(1664525,seed)+1013904223)|0;return (seed>>>0)/4294967296}}
function patch(c,rx,ry,r,w,h,col){for(let i=0;i<r;i++){const x=rx+Math.floor(Math.random()*w),y=ry+Math.floor(Math.random()*h);R(c,x,y,2,2,col)}}
function pixNoise(c,seed,x0,y0,w,h,colors,count,sx=9,sy=3){const rnd=random(seed);for(let i=0;i<count;i++){const x=x0+Math.floor(rnd()*w),y=y0+Math.floor(rnd()*h);R(c,x,y,2+Math.floor(rnd()*sx),1+Math.floor(rnd()*sy),colors[(rnd()*colors.length)|0])}}
function arch(c,x,y,col){R(c,x+6,y,26,4,col);R(c,x+3,y+4,32,5,col);R(c,x,y+9,38,64,col);R(c,x+6,y+11,26,1,"#3a1619");R(c,x+18,y+9,2,64,"#361318")}
function castle(c,rnd){R(c,0,0,FULL,HEIGHT,"#0b0c0b");R(c,0,0,FULL,145,"#12120f");
for(let i=0;i<5;i++){const base=i*WIDTH;
R(c,base,6,WIDTH,13,i%2?"#101211":"#151714");
R(c,base,135,WIDTH,38,"#0c0b09");
for(let j=0;j<5;j++){const x=base+12+j*77+Math.floor(rnd()*13);arch(c,x,47+Math.floor(rnd()*12),j%2?"#752019":"#94261c");R(c,x-4,44,5,101,"#0b0b0a");R(c,x+37,44,5,101,"#0b0b0a")}
for(let j=0;j<4;j++){const x=base+21+j*92;R(c,x,0,14,141,"#0b0c0a");R(c,x-3,119,20,3,"#1e1a15");R(c,x-5,137,24,5,"#1b1614")}
if(i===0||i===4){R(c,base+320,62,12,86,"#24231b");R(c,base+312,57,28,5,"#424138")}
if(i===1||i===3){for(let j=0;j<3;j++){const x=base+38+j*145;R(c,x,135,2,18,"#928465");R(c,x-2,142,6,4,"#e4a63b");R(c,x-5,136,12,5,"#995223")}}
pixNoise(c,3000+i,base,8,WIDTH,143,["#23201b","#181914","#23211e"],650,5,2);
}
R(c,0,166,FULL,8,"#171915");R(c,0,173,FULL,4,"#d0cdc0");R(c,0,177,FULL,39,"#a6a8a3");
for(let x=0;x<FULL;x+=32){R(c,x,179,1,37,"#777d78");R(c,x+1,197,31,1,"#747e78");R(c,x+12,181,2,1,"#d2d0c2");}
for(let x=18;x<FULL;x+=183){const k=Math.floor(rnd()*8);R(c,x,177,2,6+k,"#b45f3f");R(c,x+2,178,4,2,"#bb8a65");R(c,x+2,185,2,k,"#aa5c35")}
pixNoise(c,1064,0,182,FULL,34,["#d1d0c5","#818984","#aaa69e"],1000,3,2);
}
function wilds(c,rnd){R(c,0,0,FULL,HEIGHT,"#2d6f9e");
for(let x=0;x<FULL;x+=26){R(c,x,0,26,157,["#285d90","#2a6393","#306c99","#28769b"][(x/26)%4|0])}
for(let x=0;x<FULL;x+=57){const len=60+Math.floor(rnd()*80);R(c,x,0,35,len,"#bb9628");R(c,x-9,len-23,52,17,"#a78a32");R(c,x+7,len-17,17,30,"#262a28");R(c,x+9,len-5,13,37,"#181b1c");}
for(let x=0;x<FULL;x+=103){const crown=25+Math.floor(rnd()*45);R(c,x,0,95,crown,"#8b2527");R(c,x+20,crown-2,71,12,"#aa3a31");pixNoise(c,x+215,x,0,101,crown+16,["#bd4131","#711f27","#913125"],210,7,4);}
for(let i=0;i<5;i++){const base=i*WIDTH;
const cliff=37+Math.floor(rnd()*28);R(c,base+88,102,190,72,"#181918");
R(c,base+62,128,218,28,"#101511");R(c,base+257,153,73,21,"#171916");
for(let j=0;j<12;j++){const x=base+Math.floor(rnd()*WIDTH),y=95+Math.floor(rnd()*72);R(c,x,y,6+Math.floor(rnd()*25),4+Math.floor(rnd()*13),rnd()>.5?"#272d23":"#131915")}
R(c,base+3,73,40,101,"#29668f");R(c,base+13,74,23,98,"#b4dce2");R(c,base+17,74,13,98,"#e9f2df");
R(c,base+101,84,15,90,"#161716");R(c,base+100,cliff,16,23,"#222925");
}
R(c,0,161,FULL,13,"#111612");R(c,0,172,FULL,4,"#e8ebda");
R(c,0,176,FULL,7,"#a4aa9b");R(c,0,183,FULL,HEIGHT-183,"#326b9e");
for(let y=187;y<HEIGHT;y+=5)pixNoise(c,y*293,0,y,FULL,4,["#9dbbcc","#568db4","#d2dfe2"],210,13,2);
for(let x=0;x<FULL;x+=57){R(c,x,177,16,2,"#f3f2e5");R(c,x+37,179,10,2,"#eff4e5")}
}
function mines(c,rnd){R(c,0,0,FULL,HEIGHT,"#41372d");
for(let y=0;y<156;y+=17){for(let x=0;x<FULL;x+=33){R(c,x+Math.floor(rnd()*4),y,27+Math.floor(rnd()*30),12+Math.floor(rnd()*15),["#41352c","#504135","#574437","#372f2a"][(rnd()*4)|0])}}
for(let r=0;r<5;r++){const base=r*WIDTH;
R(c,base,105,WIDTH,68,"#1a1817");
for(let j=0;j<7;j++){const x=base+j*55+Math.floor(rnd()*15);const h=40+Math.floor(rnd()*45);
R(c,x,8,11,h,"#312c25");R(c,x+1,8+h,6,2+Math.floor(rnd()*18),"#5a4936")}
R(c,base,0,WIDTH,25,"#211e1c");
for(let j=0;j<5;j++){const x=base+j*83+Math.floor(rnd()*34),ht=Math.floor(rnd()*23);R(c,x,138-ht,39,30+ht,"#2b251f");R(c,x+8,137-ht,21,5,"#3f3830")}
for(let j=0;j<2;j++){const x=base+31+j*165;R(c,x,124,2,50,"#756557");R(c,x-11,132,25,3,"#4b4741");R(c,x-4,136,7,3,"#868374")}
pixNoise(c,900+r,base,42,WIDTH,129,["#5d4c38","#332923","#5a4536"],390,10,3);
}
R(c,0,164,FULL,9,"#2a241e");R(c,0,172,FULL,4,"#d4b329");R(c,0,176,FULL,40,"#4d3d2f");
for(let x=0;x<FULL;x+=11){const h=2+Math.floor(rnd()*8);R(c,x,176,2+Math.floor(rnd()*5),h,rnd()>.6?"#e1ce20":"#bea625")}
for(let x=0;x<FULL;x+=47){R(c,x,193,34,3,"#342e26");R(c,x+12,206,7,2,"#675341")}
pixNoise(c,4002,0,179,FULL,37,["#806843","#352e2a","#ac9145"],800,6,2);
}
function clouds(c,rnd){R(c,0,0,FULL,HEIGHT,"#a43426");
for(let y=0;y<HEIGHT;y+=22){R(c,0,y,FULL,22,["#a53a2a","#ab3f2c","#a8472c","#9b3228","#803027","#642522","#522221","#402122","#352025","#2d1c1d"][(y/22)|0])}
for(let x=0;x<FULL;x+=21){const y=28+Math.floor(rnd()*135);R(c,x,y,24+Math.floor(rnd()*31),3+Math.floor(rnd()*5),rnd()>.55?"#b64a2a":"#8d2f25")}
for(let r=0;r<5;r++){const base=r*WIDTH;
for(let j=0;j<4;j++){const x=base+j*102+14+Math.floor(rnd()*22), h=65+Math.floor(rnd()*72);
R(c,x,37,47,116,"#a56c31");R(c,x-8,30,61,16,"#d7b24b");R(c,x+7,148-h,7,h,"#60482f");
R(c,x,66,1,107,"#cb9c41");R(c,x+44,66,1,107,"#cb9c41");
R(c,x+14,103,2,45,"#bf7e3c")}
R(c,base,0,WIDTH,20,"#873827");R(c,base+40,5,75,7,"#b44826");
}
R(c,0,168,FULL,7,"#fee565");R(c,0,175,FULL,7,"#f4d050");R(c,0,182,FULL,34,"#6a3927");
for(let x=0;x<FULL;x+=18){R(c,x,182,2,33,"#9d562f");R(c,x+7,188,3,14,"#4a2d22")}
for(let r=0;r<5;r++){const x=r*WIDTH+55;R(c,x,182,3,34,"#936233");R(c,x+236,182,3,34,"#936233");R(c,x+3,195,236,2,"#523a2b")}
}
function create(stage){const canvas=document.createElement("canvas");canvas.width=FULL;canvas.height=HEIGHT;const c=canvas.getContext("2d",{alpha:false});c.imageSmoothingEnabled=false;const rnd=random(20261026+stage.length*4321);if(stage==="castle")castle(c,rnd);else if(stage==="wilds")wilds(c,rnd);else if(stage==="mines")mines(c,rnd);else clouds(c,rnd);return canvas}
function backdrop(g,stage,camera){if(!cache.has(stage))cache.set(stage,create(stage));const scene=cache.get(stage);R(g,0,0,WIDTH,HEIGHT,"#111");const x=Math.round(LEFT-camera+WIDTH/2);g.drawImage(scene,x,0);}
function line(g,x1,y1,x2,y2,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.lineCap="butt";g.beginPath();g.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);g.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);g.stroke()}
function fighter(g,p,camera,time){if(!p.alive)return;const x=Math.round(p.x-camera+WIDTH/2),y=Math.round(p.y),f=p.dir;
if(x<-55||x>WIDTH+55)return;
const c=p.id===0?"#fffa11":"#fc9852",shadow=p.id===0?"#d9ca0b":"#d5733e";
const running=Math.abs(p.vx)>28,air=p.y<GROUND-2,roll=p.roll>0;
const stride=running?Math.sin(p.step*2.25)*7:0,bob=running?Math.abs(Math.sin(p.step*2.25))*1.3:0;
const forward=p.attack>.055&&p.attack<.19,dy=air?-1:0;
if(roll){R(g,x-12,y-11,24,6,c);R(g,x+f*10-3,y-14,7,8,c);R(g,x-f*11-2,y-5,11,4,shadow);}
else{
const hip=y-13-bob,shoulder=y-28-bob,headY=y-36-bob+dy;
line(g,x-2,hip,x-4-stride*.7,y-2,c,3);
line(g,x+2,hip,x+5+stride*.7,y-2,shadow,3);
R(g,x-6-stride*.7,y-3,6,3,c);R(g,x+3+stride*.7,y-3,6,3,shadow);
line(g,x,hip,x,shoulder,c,5);R(g,x-4,shoulder-2,8,6,c);
R(g,x-4,headY,9,9,c);R(g,x+f*2,headY+2,2,2,"#403622");
if(p.stun>0){line(g,x,shoulder,x-f*10,shoulder+11,c,3)}
else{const armY=shoulder+8-(p.level-1)*6;line(g,x+f*1,shoulder+4,x+f*(forward?12:9),armY,c,3);R(g,x+f*(forward?13:9)-2,armY-2,4,4,c);line(g,x-f*2,shoulder+4,x-f*7,shoulder+11,shadow,2)}
if(air){line(g,x-1,y-13,x-f*9,y-10,c,3);line(g,x+1,y-13,x+f*10,y-18,shadow,3)}
}
if(p.sword){const bladeY=roll?y-7:y-23-(p.level-1)*7-(forward?0:0);
const origin=x+f*(forward?13:11),end=origin+f*(forward?35:27);
line(g,origin,bladeY,end,bladeY,"#ecede6",1);
R(g,origin+(f<0?-2:0),bladeY-3,3,7,"#fdf7e6");
R(g,end+(f<0?0:-1),bladeY-1,2,2,"#ffffff");
}
if(!p.sword&&forward)line(g,x+f*7,y-24,x+f*17,y-23,c,4);
}
function foreground(g,stage,camera,time){if(stage==="wilds"){for(let i=0;i<80;i++){const xx=i*29-960-camera+WIDTH/2;if(xx<-20||xx>WIDTH+20)continue;const h=(i*9)%7+2;R(g,xx,GROUND-h,1,h,"#242922");if(i%3===0)R(g,xx+4,GROUND-4,2,4,"#4b5e35")}}
if(stage==="mines"){for(let i=0;i<90;i++){const x=i*23-960-camera+WIDTH/2;if(x<-4||x>WIDTH+4)continue;R(g,x,GROUND-1,3,2,i%3?"#d0bc22":"#a49118")}}}
function arrow(g,priority,time){if(priority<0)return;
const col=priority===0?"#ffff03":"#3dffac",f=priority===0?1:-1,x=priority===0?WIDTH-77:24,y=16;
g.save();g.translate(x,y);if(f<0){g.translate(64,0);g.scale(-1,1)}
R(g,0,8,47,9,col);R(g,45,3,7,19,col);R(g,50,0,7,25,col);R(g,55,5,5,15,col);R(g,59,10,6,5,col);
g.fillStyle="#100e0a";g.font="bold 22px monospace";g.textBaseline="top";g.fillText("GO",8,-13);
g.fillStyle=col;g.fillText("GO",6,-15);
g.restore();}
function finish(g,priority,time){if(priority<0)return;g.globalAlpha=.1+Math.sin(time*3)*.03;R(g,priority===0?WIDTH-3:0,35,3,GROUND-35,priority===0?"#ffe500":"#f78b49");g.globalAlpha=1;}
window.GameVisuals={backdrop,fighter,foreground,arrow,finish};
})();