(() => {
"use strict";
const canvas=document.getElementById("game"),g=canvas.getContext("2d",{alpha:false});g.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id),W=384,H=216,GROUND=174,ROOM=384,END=2*ROOM+ROOM/2;
let stage="castle",mode="ai",started=false,finished=false,last=0,acc=0,elapsed=0,camera=0,priority=-1,round=0,shake=0,flash=0,particles=[],drops=[],players=[],socket=null,onlineId=-1,serverHost=false,connected=false,lastNet=0;
const keys={},pressed={};let audio=null,silent=false;
const palette={castle:{sky:"#b5bba7",back:"#81947d",ground:"#413846",floor:"#827d70",detail:"#687460"},wilds:{sky:"#9dcba0",back:"#608c75",ground:"#354a38",floor:"#657943",detail:"#456f4b"},mines:{sky:"#3b393e",back:"#484752",ground:"#27242e",floor:"#736a5e",detail:"#66616a"},clouds:{sky:"#8da9c8",back:"#bdcedc",ground:"#687fa0",floor:"#e8e3db",detail:"#a0b5cc"}};
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function sound(note=250,dur=.07,type="square",vol=.025){if(silent)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),gain=audio.createGain();o.type=type;o.frequency.value=note;gain.gain.setValueAtTime(vol,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(gain).connect(audio.destination);o.start();o.stop(audio.currentTime+dur)}catch(e){}}
function burst(x,y,color,n=16){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-105,105),vy:rand(-125,40),life:rand(.2,.65),max:.65,color,size:rand(1,3)})}
function fighter(id,x){return {id,x,y:GROUND,vx:0,vy:0,dir:id===0?1:-1,level:1,alive:true,respawn:0,sword:true,attack:0,attackId:0,hitId:-1,cool:0,throwCool:0,step:0,roll:0,stun:0,score:0};}
function reset(which=mode){stage=$("stage").value;mode=which;players=[fighter(0,-10),fighter(1,28)];priority=-1;camera=0;round=0;particles=[];drops=[];elapsed=0;finished=false;started=true;flash=0;shake=0;hideMenus();$("hudRoom").textContent="CENTER";$("hudStage").textContent=stage.toUpperCase();$("hudCenter").textContent="FIGHT";}
function hideMenus(){["menu","result","onlineMenu"].forEach(id=>$(id).classList.add("hidden"))}
function showMenu(){started=false;finished=false;if(socket){socket.close();socket=null;}connected=false;hideMenus();$("menu").classList.remove("hidden")}
function trigger(p,kind){if(!p.alive||p.stun>0)return;if(kind==="attack"){if(p.cool>0)return;p.attack=.20;p.cool=.33;p.attackId++;p.hitId=-1;p.vx+=p.dir*(p.sword?60:30);sound(p.sword?450:180,.055)}if(kind==="jump"&&p.y>=GROUND-.1){if(keysFor(p).down&&Math.abs(p.vx)>25){p.roll=.42;p.vx=p.dir*180;sound(180,.07)}else{p.vy=-225;sound(390,.07)}}if(kind==="throw"&&p.sword&&p.throwCool<=0){drops.push({x:p.x+p.dir*12,y:p.y-17,vx:p.dir*250,vy:-9,dir:p.dir,air:true,owner:p.id,ttl:1.6});p.sword=false;p.throwCool=.5;p.attack=0;sound(650,.15,"sawtooth")}}
function keysFor(p){if(mode==="online"&&p.id!==onlineId)return {};if(p.id===0||mode==="ai"||mode==="online")return {left:keys.a||keys.left,right:keys.d||keys.right,up:keys.w||keys.up,down:keys.s||keys.down,attack:keys.f||keys.attack,jump:keys.g||keys.jump,throw:keys.h||keys.throw};return {left:keys.arrowleft,right:keys.arrowright,up:keys.arrowup,down:keys.arrowdown,attack:keys.k,jump:keys.l,throw:keys[";"]};}
let aiTimer=0,aiActions={};
function brain(dt){let p=players[1],q=players[0];if(!p.alive||!q.alive){aiActions={left:false,right:false};return aiActions;}aiTimer-=dt;const distance=q.x-p.x,abs=Math.abs(distance),target=Math.sign(distance)||-1;
if(aiTimer<=0){aiTimer=rand(.13,.36);aiActions={left:target<0,right:target>0,up:false,down:false};if(abs<78){aiActions.up=p.level<q.level&&Math.random()>.55;aiActions.down=p.level>q.level&&Math.random()>.55;if(p.sword&&abs<27&&p.cool<=0&&Math.random()>.29)trigger(p,"attack");if(!p.sword&&abs<20&&Math.random()>.35)trigger(p,"attack");if(abs<24&&Math.random()<.14)trigger(p,"jump");}else if(abs>100&&Math.random()<.12)trigger(p,"jump");if(p.sword&&abs>55&&abs<108&&Math.random()<.10)trigger(p,"throw");}
return aiActions;}
function control(p,k={},dt){if(!p.alive)return;p.cool=Math.max(0,p.cool-dt);p.throwCool=Math.max(0,p.throwCool-dt);p.attack=Math.max(0,p.attack-dt);p.roll=Math.max(0,p.roll-dt);p.stun=Math.max(0,p.stun-dt);
if(p.stun>0)return;
let dir=(k.right?1:0)-(k.left?1:0);if(dir&&p.roll===0){p.dir=dir;const target=dir*(p.attack>0?90:125);p.vx+=(target-p.vx)*Math.min(1,dt*13)}else if(p.roll<=0)p.vx*=Math.max(0,1-dt*12);
if(p.roll>0)p.vx=p.dir*170;
if(k.up&&!p.prevUp)p.level=clamp(p.level+1,0,2);
if(k.down&&!p.prevDown&&p.roll<=0){if(!p.sword){const pick=drops.find(d=>!d.air&&Math.abs(d.x-p.x)<16);if(pick){p.sword=true;drops.splice(drops.indexOf(pick),1);sound(420,.06)}}else p.level=clamp(p.level-1,0,2)}
p.prevUp=!!k.up;p.prevDown=!!k.down;
if(k.attack&&!p.prevAttack)trigger(p,"attack");if(k.jump&&!p.prevJump)trigger(p,"jump");if(k.throw&&!p.prevThrow)trigger(p,"throw");
p.prevAttack=!!k.attack;p.prevJump=!!k.jump;p.prevThrow=!!k.throw;}
function kill(p,killer){if(!p.alive)return;p.alive=false;p.respawn=1.05;p.vx=0;p.vy=0;priority=killer.id;killer.score++;flash=.14;shake=5;round++;burst(p.x,p.y-16,p.id===0?"#ffe537":"#f16b43",27);sound(95,.24,"sawtooth",.055);}
function combat(){for(let i=0;i<2;i++){let p=players[i],q=players[1-i];if(!p.alive||!q.alive||p.hitId===p.attackId||p.attack<=.04||p.attack>=.195)continue;
const dx=q.x-p.x,dy=Math.abs(q.y-p.y),range=p.sword?29:14;
if(dx*p.dir>0&&dx*p.dir<range&&dy<14){p.hitId=p.attackId;if(p.sword){if(q.sword&&p.level===q.level&&q.dir===-p.dir){burst((p.x+q.x)/2,p.y-18,"#e3e5d1",7);p.vx=-p.dir*80;q.vx=-q.dir*45;sound(760,.045);}
else if(q.roll>0&&p.level>0){burst(q.x,q.y-13,"#ede9b8",5);}
else kill(q,p);}else{q.stun=.34;q.vx=p.dir*92;burst(q.x,q.y-13,"#f1ccb3",4);if(q.stun&&Math.random()>.6&&q.sword){q.sword=false;drops.push({x:q.x,y:q.y-19,vx:q.dir*70,vy:-105,dir:q.dir,air:false,ttl:5})}sound(170,.07)}}}}
function projectiles(dt){for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.ttl-=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=420*dt;if(d.y>GROUND-3){d.y=GROUND-3;d.vy=0;d.vx=0;d.air=false}
if(d.air){for(const p of players)if(p.alive&&p.id!==d.owner&&Math.abs(p.x-d.x)<9&&Math.abs(p.y-15-d.y)<12){const attacker=players[d.owner];if(p.sword&&p.level>=1&&p.dir===-d.dir){d.air=false;d.vx=0;d.vy=0;burst(d.x,d.y,"#eee",6);sound(720,.07)}else kill(p,attacker);break}}
if(d.ttl<=0||Math.abs(d.x)>END+300)drops.splice(i,1)}}
function tick(dt){elapsed+=dt;flash=Math.max(0,flash-dt);shake=Math.max(0,shake-dt*16);
if(!started||finished)return;if(mode==="online"&&!serverHost){return;}
const ai=mode==="ai"?brain(dt):null;players.forEach((p,i)=>{if(!p.alive){p.respawn-=dt;if(p.respawn<=0){const opponent=players[1-i],want=p.id===0?-1:1;p.x=clamp(opponent.x+want*80,-END+40,END-40);p.y=GROUND;p.vy=0;p.alive=true;p.sword=true;p.level=1;p.attack=0;p.stun=.15;burst(p.x,p.y-12,p.id===0?"#ffe84c":"#ff7858",9)}return}
const k=i===1&&mode==="ai"?ai:mode==="online"?netKeys[i]||{}:keysFor(p);control(p,k,dt);p.vy+=525*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
if(p.y>=GROUND){p.y=GROUND;p.vy=0}p.x=clamp(p.x,-END-10,END+10);p.step+=Math.abs(p.vx)*dt/17;
});
combat();projectiles(dt);
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=350*dt;if(p.life<=0)particles.splice(i,1)}
const p=players[priority];if(p&&p.alive&&((priority===0&&p.x>=END)||(priority===1&&p.x<=-END))){finished=true;showResult(priority)}
const center=priority<0?0:players[priority].x;camera+=((clamp(center,-END+ROOM/2,END-ROOM/2))-camera)*Math.min(1,dt*4);
$("hudCenter").textContent=priority<0?"FIGHT":priority===0?"YELLOW ▶▶":"◀◀ ORANGE";$("hudRoom").textContent=(clamp(Math.floor((camera+END)/(ROOM)),0,4)+1)+" / 5";
if(mode==="online"&&serverHost&&socket?.readyState===1&&elapsed-lastNet>.05){lastNet=elapsed;socket.send(JSON.stringify({type:"state",players,camera,priority,round,drops,finished,elapsed}))}
}
const netKeys=[{},{}];
function showResult(id){$("winner").textContent=(id===0?"YELLOW":"ORANGE")+" WINS";$("winner").style.color=id===0?"#f8e935":"#ff8562";$("result").classList.remove("hidden");sound(600,.2);setTimeout(()=>sound(900,.35),160)}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function backdrop(){window.GameVisuals.backdrop(g,stage,camera)}
function drawFighter(p){window.GameVisuals.fighter(g,p,camera,elapsed)}
function draw(){g.save();if(shake)g.translate(Math.round(rand(-shake,shake)),Math.round(rand(-shake/2,shake/2)));backdrop();
for(const d of drops){let x=d.x-camera+W/2;rect(x-8,d.y,16,2,"#d9dedf");rect(x+5,d.y-4,3,9,"#efd089")}
players.forEach(drawFighter);
window.GameVisuals.foreground(g,stage,camera,elapsed);
for(const p of particles)rect(p.x-camera+W/2,p.y,p.size,p.size,p.color);
window.GameVisuals.arrow(g,priority,elapsed);window.GameVisuals.finish(g,priority,elapsed);
if(flash)rect(0,0,W,H,"#fff4dc");
g.restore();}
function loop(t){if(!last)last=t;acc+=Math.min(.07,(t-last)/1000);last=t;let n=0;while(acc>=1/60&&n++<5){tick(1/60);acc-=1/60}draw();requestAnimationFrame(loop)}
const keynames={ArrowLeft:"arrowleft",ArrowRight:"arrowright",ArrowUp:"arrowup",ArrowDown:"arrowdown"," ":"jump"};
window.addEventListener("keydown",e=>{const k=keynames[e.key]||e.key.toLowerCase();if(["arrowleft","arrowright","arrowup","arrowdown"," ",";"].includes(k))e.preventDefault();if(k==="escape"){showMenu();return;}keys[k]=true;pressed[k]=true;sendKeys()});
window.addEventListener("keyup",e=>{const k=keynames[e.key]||e.key.toLowerCase();keys[k]=false;sendKeys()});window.addEventListener("blur",()=>{for(const k in keys)keys[k]=false;sendKeys()});
document.querySelectorAll("#touch button").forEach(b=>{const k=b.dataset.key;const toggle=(on,e)=>{e.preventDefault();keys[k]=on;b.classList.toggle("pressed",on);sendKeys()};b.addEventListener("pointerdown",e=>{b.setPointerCapture(e.pointerId);toggle(true,e)});["pointerup","pointercancel","lostpointercapture"].forEach(event=>b.addEventListener(event,e=>toggle(false,e)))});
function sendKeys(){if(mode==="online"&&socket?.readyState===1)socket.send(JSON.stringify({type:"input",keys:keysFor(players[onlineId]||{id:0})}))}
function setupOnline(){hideMenus();$("onlineMenu").classList.remove("hidden");$("onlineStatus").textContent="서버가 설정되지 않았습니다. 아래 주소를 입력하세요.";const saved=localStorage.getItem("fencingWs");if(saved)$("serverUrl").value=saved}
function connect(){const url=$("serverUrl").value.trim(),room=$("roomCode").value.trim().toUpperCase();if(!/^wss?:\/\//.test(url)){ $("onlineStatus").textContent="ws:// 또는 wss:// 주소를 입력하세요.";return}if(!/^[A-Z0-9]{4,10}$/.test(room)){$("onlineStatus").textContent="방 코드는 영문/숫자 4~10자입니다.";return}
try{socket=new WebSocket(url);localStorage.setItem("fencingWs",url);$("onlineStatus").textContent="서버 연결 중...";
socket.onopen=()=>socket.send(JSON.stringify({type:"join",room,stage:$("stage").value}));
socket.onmessage=event=>{let m;try{m=JSON.parse(event.data)}catch{return}
if(m.type==="joined"){onlineId=m.playerId;serverHost=onlineId===0;connected=true;$("onlineStatus").textContent=onlineId===0?"방 생성 완료 · 상대 접속 대기":"상대에게 연결했습니다";if(onlineId===0){reset("online");$("hudCenter").textContent="WAITING FOR RIVAL"}}
if(m.type==="start"){if(!started)reset("online");$("hudCenter").textContent="FIGHT"}
if(m.type==="input"&&serverHost){netKeys[1]=m.keys||{}}
if(m.type==="state"&&!serverHost){players=m.players||players;camera=m.camera||0;priority=m.priority;round=m.round;drops=m.drops||[];elapsed=m.elapsed;started=true;if(!$("onlineMenu").classList.contains("hidden"))hideMenus();if(m.finished&&!finished){finished=true;showResult(priority)}}
if(m.type==="opponent_left"){showMenu();alert("상대가 연결을 종료했습니다.")}
if(m.type==="error")$("onlineStatus").textContent=m.message||"연결 오류";
};
socket.onerror=()=>{$("onlineStatus").textContent="연결할 수 없습니다. Render 서버 주소와 상태를 확인하세요."};
socket.onclose=()=>{if(connected&&started&&!finished){started=false;showMenu()}connected=false}
}catch(e){$("onlineStatus").textContent=e.message}}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.mode==="online")setupOnline();else reset(b.dataset.mode)}));
$("connectBtn").addEventListener("click",connect);$("backBtn").addEventListener("click",showMenu);$("resultBack").addEventListener("click",showMenu);$("again").addEventListener("click",()=>{if(mode==="online")setupOnline();else reset(mode)});$("mute").addEventListener("click",()=>{silent=!silent;$("mute").textContent=silent?"×":"♫"});
requestAnimationFrame(loop);
})();