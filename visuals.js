/* Original procedural pixel art. No third-party game assets are bundled. */
(() => {
"use strict";
const WIDTH=384, HEIGHT=216, GROUND=174, FULL=1920, LEFT=-960;
const cache=new Map();
const terrainGaps={
 castle:[],
 wilds:[[-616,-561],[456,506]],
 mines:[],
 clouds:[[-747,-688],[-303,-244],[222,284],[653,711]]
};
function isGap(stage,x){return (terrainGaps[stage]||[]).some(([a,b])=>x>a&&x<b)}
window.FencingTerrain={isGap,gaps:terrainGaps};

function R(c,x,y,w,h,color){if(w<=0||h<=0)return;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function random(seed){return function(){seed=(Math.imul(1664525,seed)+1013904223)|0;return (seed>>>0)/4294967296}}
function patch(c,rx,ry,r,w,h,col){for(let i=0;i<r;i++){const x=rx+Math.floor(Math.random()*w),y=ry+Math.floor(Math.random()*h);R(c,x,y,2,2,col)}}
function pixNoise(c,seed,x0,y0,w,h,colors,count,sx=9,sy=3){const rnd=random(seed);for(let i=0;i<count;i++){const x=x0+Math.floor(rnd()*w),y=y0+Math.floor(rnd()*h);R(c,x,y,2+Math.floor(rnd()*sx),1+Math.floor(rnd()*sy),colors[(rnd()*colors.length)|0])}}
function arch(c,x,y,col){R(c,x+6,y,26,4,col);R(c,x+3,y+4,32,5,col);R(c,x,y+9,38,64,col);R(c,x+6,y+11,26,1,"#3a1619");R(c,x+18,y+9,2,64,"#361318")}
function castle(c,rnd){
R(c,0,0,FULL,HEIGHT,"#080808");
for(let i=0;i<5;i++){
  const base=i*WIDTH;
  R(c,base,0,WIDTH,166,"#070807");
  for(let j=0;j<2;j++){
    const x=base+77+j*161+Math.floor(rnd()*10),y=30+j%2*9;
    arch(c,x,y,j?"#912019":"#a32319");
    R(c,x-7,y-9,6,130,"#080807");
    R(c,x+39,y-9,8,130,"#070707");
    pixNoise(c,1500+i*11+j,x,y,38,64,["#742017","#7c2019","#b2281e"],55,3,2);
  }
  R(c,base,0,WIDTH,17,"#090909");
  for(let j=0;j<3;j++){
    const x=base+12+j*152+Math.floor(rnd()*12);
    R(c,x,18,10,134,"#090909");
    R(c,x-4,136,18,12,"#0f0e0d");
  }
  if(i%2===0){
    const x=base+320;R(c,x,123,18,35,"#29241c");R(c,x-3,117,25,7,"#443929");
    R(c,x+2,115,7,3,"#f6b653");R(c,x+6,105,3,10,"#d98123");
  }
  pixNoise(c,3000+i,base,8,WIDTH,144,["#171515","#121211","#201b19"],380,3,2);
}
R(c,0,157,FULL,16,"#0b0a0a");
R(c,0,173,FULL,4,"#dad8ce");
R(c,0,177,FULL,39,"#aaaead");
for(let x=0;x<FULL;x+=39){R(c,x,177,1,39,"#969b99");R(c,x+1,197,38,1,"#8a908e")}
for(let x=12;x<FULL;x+=147){R(c,x,176,3,9,"#bb6f3a");R(c,x+3,177,7,2,"#b9895e")}
pixNoise(c,1064,0,179,FULL,37,["#ccd0c9","#9aa5a1","#b7b8ac"],430,4,2);
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
function clouds(c,rnd){
  R(c,0,0,FULL,HEIGHT,"#45243a");
  const tones=["#46263d","#49263d","#4b2a43","#51304b","#58344d","#5e3657"];
  for(let i=0;i<5;i++){let base=i*WIDTH;
    R(c,base,0,WIDTH,167,tones[i%tones.length]);
    for(let j=0;j<28;j++){
      const x=base+Math.floor(rnd()*WIDTH),y=Math.floor(rnd()*165);
      const w=10+Math.floor(rnd()*70),h=5+Math.floor(rnd()*21);
      R(c,x,y,w,h,tones[Math.floor(rnd()*tones.length)]);
    }
    for(let j=0;j<3;j++){
      const x=base+Math.floor(rnd()*WIDTH),y=100+Math.floor(rnd()*52);
      R(c,x,y,24+Math.floor(rnd()*58),5+Math.floor(rnd()*18),"#38243b");
    }
    pixNoise(c,870+i,base,0,WIDTH,172,["#43223b","#613852","#703d60"],490,4,2);
  }
  R(c,0,167,FULL,7,"#b17aba");
  R(c,0,174,FULL,42,"#a272af");
  for(let x=0;x<FULL;x+=36){
    R(c,x,174,15,1,"#c493d1");
    R(c,x+4,179,1,8,"#a875bb");
  }
  for(let i=0;i<5;i++){
    let base=i*WIDTH;
    for(let j=0;j<4;j++){
      const x=base+18+j*94;
      const h=3+Math.floor(rnd()*7);
      R(c,x,170-h,21+Math.floor(rnd()*15),h,"#ac73b2");
      R(c,x+3,170-h-2,10,3,"#b080b9");
    }
  }
  pixNoise(c,6411,0,179,FULL,37,["#ad79ba","#985ea4","#b98ac4"],400,4,1);
}
function create(stage){const canvas=document.createElement("canvas");canvas.width=FULL;canvas.height=HEIGHT;const c=canvas.getContext("2d",{alpha:false});c.imageSmoothingEnabled=false;const rnd=random(20261026+stage.length*4321);if(stage==="castle")castle(c,rnd);else if(stage==="wilds")wilds(c,rnd);else if(stage==="mines")mines(c,rnd);else clouds(c,rnd);return canvas}
function backdrop(g,stage,camera){
if(!cache.has(stage))cache.set(stage,create(stage));
const scene=cache.get(stage);
R(g,0,0,WIDTH,HEIGHT,"#111");
const x=Math.round(LEFT-camera+WIDTH/2);g.drawImage(scene,x,0);
for(const [a,b] of terrainGaps[stage]||[]){
  const left=a-camera+WIDTH/2,width=b-a;
  R(g,left,168,width,48,stage==="wilds"?"#366d96":"#352239");
  if(stage==="wilds"){
    R(g,left,186,width,2,"#78a5b9");
    R(g,left+5,192,width-10,1,"#b4d0d1");
    R(g,left-3,173,3,4,"#0d1615");R(g,left+width,173,3,4,"#0d1615");
  }else{
    R(g,left,169,1,5,"#c28ccb");R(g,left+width-1,169,1,5,"#c28ccb");
  }
}
}
function line(g,x1,y1,x2,y2,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.lineCap="butt";g.beginPath();g.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);g.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);g.stroke()}
function fighter(g,p,camera,time){
if(!p.alive)return;
const x=Math.round(p.x-camera+WIDTH/2),y=Math.round(p.y),f=p.dir;
if(x<-55||x>WIDTH+55)return;
const c=p.id===0?"#fffa11":"#fc9852",shadow=p.id===0?"#d9ca0b":"#d5733e";
const action=p.action||"idle",running=action==="run",air=action==="jump"||action==="fall",rolling=p.roll>0||action==="rolljump";
const stride=running?Math.sin(p.step*2.25)*8:0;
const bob=running?Math.abs(Math.sin(p.step*2.25)):0;
if(p.knocked>0||action==="down"){
  R(g,x-17,y-7,25,5,c);R(g,x+f*11-3,y-11,9,8,c);R(g,x-f*13,y-4,9,3,shadow);
}else if(rolling){
  R(g,x-11,y-10,22,7,c);R(g,x+f*8-3,y-14,8,7,c);
  R(g,x-f*10,y-4,13,3,shadow);
}else if(p.crouch||action==="sweep"||action==="crawl"){
  const kick=action==="sweep"&&p.attack>.055;
  R(g,x-4,y-22,9,9,c);R(g,x-6,y-14,13,8,c);
  R(g,x-7,y-7,13,6,c);
  R(g,x+f*7,y-6,kick?17:9,3,kick?c:shadow);
  R(g,x+f*1,y-16,10,4,c);
}else if(action==="dive"){
  R(g,x-f*7,y-22,19,8,c);R(g,x+f*10,y-20,9,8,c);
  R(g,x-f*6,y-16,5,17,c);
  R(g,x+f*9,y-15,13,4,shadow);
}else{
  const hip=y-13-bob,shoulder=y-28-bob,headY=y-37-bob;
  const forward=action==="lunge"&&p.attack>.055;
  const reach=forward?9:0;
  line(g,x-1,hip,x-5-stride*.7+f*reach,y-2,c,3);
  line(g,x+2,hip,x+4+stride*.7-f*reach*.2,y-2,shadow,3);
  R(g,x-7-stride*.7,y-3,7,3,c);R(g,x+2+stride*.7,y-3,8,3,shadow);
  line(g,x+f*reach*.15,hip,x+f*reach*.35,shoulder,c,5);
  R(g,x-4+f*reach*.35,shoulder-2,9,6,c);
  R(g,x-4+f*reach*.45,headY,9,9,c);
  R(g,x+f*2+f*reach*.45,headY+3,2,2,"#292121");
  const armY=shoulder+8-(p.level-1)*6;
  if(action==="throw"){
    line(g,x,shoulder+4,x+f*7,shoulder-12,c,3);
    R(g,x+f*6-2,shoulder-14,4,4,c);
  }else{
    line(g,x+f*2,shoulder+4,x+f*(forward?17:9),armY,c,3);
    R(g,x+f*(forward?17:9)-2,armY-2,5,4,c);
    line(g,x-f*2,shoulder+4,x-f*7,shoulder+11,shadow,2);
  }
  if(air){line(g,x,y-13,x-f*11,y-12,c,3);line(g,x+3,y-13,x+f*10,y-21,shadow,3)}
}
if(p.sword){
  const overhead=!!p.throwReady,forward=action==="lunge"&&p.attack>.055;
  const bladeY=overhead?y-47:rolling?y-9:y-(p.crouch?13:23)-(p.level-1)*8;
  const origin=x+f*(overhead?2:forward?15:11);
  if(overhead){
    line(g,origin,bladeY+20,origin,bladeY-4,"#f5ede8",2);
    R(g,origin-4,bladeY+17,9,2,"#fef4e6");
  }else{
    const reach=forward?39:27,end=origin+f*reach;
    line(g,origin,bladeY,end,bladeY,"#f4f1df",1);
    R(g,origin+(f<0?-2:0),bladeY-3,3,7,"#fdf7e6");
    R(g,end+(f<0?0:-1),bladeY-1,2,2,"#fff");
  }
}
if(action==="punch"&&p.attack>.055)line(g,x+f*7,y-25,x+f*19,y-22,c,4);
}

function foreground(g,stage,camera,time){if(stage==="wilds"){for(let i=0;i<80;i++){const xx=i*29-960-camera+WIDTH/2;if(xx<-20||xx>WIDTH+20)continue;const h=(i*9)%7+2;R(g,xx,GROUND-h,1,h,"#242922");if(i%3===0)R(g,xx+4,GROUND-4,2,4,"#4b5e35")}}
if(stage==="wilds"){const flow=Math.floor(time*19);for(let i=0;i<44;i++){const x=i*41-960-camera+WIDTH/2+(flow+i*7)%31;if(x<0||x>WIDTH)continue;const y=189+(i*13)%23;R(g,x,y,9+(i%4)*3,1,i%2?"#bedce0":"#719abd")}}
if(stage==="clouds"){for(let i=0;i<22;i++){const x=i*87-960-camera+WIDTH/2;if(x<-10||x>WIDTH+10)continue;const y=171-(i*7)%9;R(g,x+Math.floor(Math.sin(time*.6+i)*2),y,9,2,"#c18bcb")}}
if(stage==="mines"){const offset=Math.floor(time*22);for(let i=0;i<95;i++){const x=i*23-960-camera+WIDTH/2+offset%23;if(x<-4||x>WIDTH+4)continue;R(g,x,GROUND-1,4,2,i%3?"#e9dd2b":"#b8a517")}}}
function glyph(g,ch,x,y,color,scale=3){
const glyphs={
G:["01111","11000","10000","10111","10001","11001","01111"],
O:["01110","11011","10001","10001","10001","11011","01110"]
};
const map=glyphs[ch]||glyphs.O;
for(let row=0;row<map.length;row++)for(let col=0;col<5;col++)if(map[row][col]==="1")R(g,x+col*scale,y+row*scale,scale,scale,color);
}
function arrow(g,priority,time){
if(priority<0)return;
const col=priority===0?"#fff809":"#47f8b5",x=priority===0?WIDTH-82:11,y=13;
g.save();g.translate(x,y);
if(priority===1){g.translate(70,0);g.scale(-1,1)}
R(g,2,25,54,10,"#0b080b");R(g,1,24,53,10,col);
for(let i=0;i<13;i++){
  const thickness=13-Math.abs(6-i)*2;
  R(g,53+i,23+(13-thickness)/2,1,Math.max(1,thickness),col);
}
glyph(g,"G",8,0,"#0e0910",3);glyph(g,"O",27,0,"#0e0910",3);
glyph(g,"G",6,-2,col,3);glyph(g,"O",25,-2,col,3);
g.restore();
}

function finish(g,priority,time){if(priority<0)return;g.globalAlpha=.1+Math.sin(time*3)*.03;R(g,priority===0?WIDTH-3:0,35,3,GROUND-35,priority===0?"#ffe500":"#f78b49");g.globalAlpha=1;}
window.GameVisuals={backdrop,fighter,foreground,arrow,finish};
})();