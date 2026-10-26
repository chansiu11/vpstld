// Run with node --test tests/smoke.cjs (no browser or dependencies required).
const assert=require("node:assert/strict");
const test=require("node:test");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.join(__dirname,"..");
function boot(){
  const handlers={};const elements=new Map();const frames=[];let draws=0,now=0;
  const ctx={save(){},restore(){},translate(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){draws++},fillText(){draws++},drawImage(){draws++},fillRect(){draws++},imageSmoothingEnabled:false};
  function elt(id){
    if(elements.has(id))return elements.get(id);
    const o={value:id==="stage"?"castle":"",textContent:"",style:{},dataset:{},
      classList:{add(){},remove(){},contains(){return false}},
      getContext(){return ctx},setPointerCapture(){},
      addEventListener(name,fn){this["on"+name]=fn}};
    elements.set(id,o);return o;
  }
  const modes=["ai","local","online"].map(name=>{const o=elt("button-"+name);o.dataset.mode=name;return o});
  const document={getElementById:elt,createElement(){return {width:0,height:0,getContext(){return ctx}}},
    querySelectorAll(query){return query==="[data-mode]"?modes:[]}};
  class MockSocket{
    constructor(url){this.url=url;this.readyState=1;this.sent=[];this.closed=false;MockSocket.current=this;}
    send(msg){this.sent.push(JSON.parse(msg))}
    close(){this.closed=true;this.readyState=3}
  }
  const window={addEventListener(name,fn){handlers[name]=fn}};
  const sandbox={window,document,WebSocket:MockSocket,
    requestAnimationFrame(fn){frames.push(fn)},
    localStorage:{getItem(){return null},setItem(){}},
    alert(){},setTimeout(){},console};
  vm.createContext(sandbox);
  const visuals=fs.readFileSync(path.join(root,"visuals.js"),"utf8");
  let game=fs.readFileSync(path.join(root,"game.js"),"utf8");
  // Read-only in-test introspection; the shipped source is left unchanged.
  game=game.replace("requestAnimationFrame(loop);","window.__state=()=>({players,camera,priority,started,mode,stage});window.__debug={trigger,combat,kill,control,projectiles,tick};requestAnimationFrame(loop);");
  assert.ok(game.includes("window.__state"),"test introspection could not be installed");
  vm.runInContext(visuals,sandbox,{filename:"visuals.js"});
  vm.runInContext(game,sandbox,{filename:"game.js"});
  const frame=(count=1)=>{for(let i=0;i<count;i++){const callback=frames.shift();assert.equal(typeof callback,"function");now+=1000/60;callback(now)}};
  const input=(key,down=true)=>handlers[down?"keydown":"keyup"]({key,preventDefault(){}});
  return {modes,elt,frame,input,window,get draws(){return draws},MockSocket};
}
test("AI and local games render all 4 backgrounds for 120 frames each",()=>{
 const g=boot();let previous=0;
 for(const mode of ["ai","local"])for(const stage of ["castle","wilds","mines","clouds"]){
   g.elt("stage").value=stage;
   g.modes.find(x=>x.dataset.mode===mode).onclick();
   assert.equal(g.window.__state().started,true);
   g.frame(120);
   assert.ok(g.draws>previous,"expected raster graphics in "+stage);
   previous=g.draws;
   assert.equal(g.window.__state().stage,stage);
 }
});
test("player input affects movement in local match",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="local").onclick();
 const start=g.window.__state().players.map(x=>x.x);
 g.input("d");g.frame(30);g.input("d",false);
 assert.ok(g.window.__state().players[0].x>start[0]+5,"left player should move");
 g.input("ArrowRight");g.frame(30);g.input("ArrowRight",false);
 assert.ok(g.window.__state().players[1].x>start[1]+5,"right player should move");
});
test("online host stays in waiting room, then receives local input",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="online").onclick();
 g.elt("serverUrl").value="wss://example.invalid";
 g.elt("roomCode").value="DUEL01";
 g.elt("connectBtn").onclick();
 const socket=g.MockSocket.current;
 assert.ok(socket);
 socket.onopen();
 assert.equal(socket.sent.at(-1).type,"join");
 socket.onmessage({data:JSON.stringify({type:"joined",playerId:0})});
 assert.equal(g.window.__state().started,false);
 socket.onmessage({data:JSON.stringify({type:"start"})});
 assert.equal(g.window.__state().started,true);
 const x=g.window.__state().players[0].x;
 g.input("d");g.frame(24);g.input("d",false);
 assert.ok(g.window.__state().players[0].x>x+5,"online host player must receive local controls");
});

test("an armed fencer's extended blade matters without attacking",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="local").onclick();
 const [a,b]=g.window.__state().players;
 a.x=0;a.y=174;a.dir=1;a.sword=true;a.level=1;
 b.x=30;b.y=174;b.dir=-1;b.sword=false;b.stun=0;
 g.window.__debug.combat();
 assert.equal(b.alive,false,"unarmed challenger should not walk through a drawn blade");
 assert.equal(g.window.__state().priority,0);
});
test("matching idle blade heights create a passive guard",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="local").onclick();
 const [a,b]=g.window.__state().players;
 a.x=0;a.y=174;a.dir=1;a.sword=true;a.level=1;
 b.x=30;b.y=174;b.dir=-1;b.sword=true;b.level=1;
 g.window.__debug.combat();
 assert.equal(a.alive,true);
 assert.equal(b.alive,true);
});
test("a downed opponent can be finished by an unarmed punch",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="local").onclick();
 const [a,b]=g.window.__state().players;
 a.x=0;a.dir=1;a.sword=false;a.cool=0;a.knocked=0;a.stun=0;
 b.x=15;b.sword=false;b.knocked=.9;b.stun=.25;b.y=a.y;
 g.window.__debug.trigger(a,"attack");a.attack=.15;
 g.window.__debug.combat();
 assert.equal(b.alive,false);
 assert.equal(g.window.__state().priority,0);
});
test("a fighter eventually respawns ahead of the advancing opponent",()=>{
 const g=boot();g.modes.find(x=>x.dataset.mode==="local").onclick();
 const [a,b]=g.window.__state().players;a.x=0;b.x=24;
 g.window.__debug.kill(b,a);
 assert.equal(b.alive,false);
 assert.equal(g.window.__state().priority,0);
 g.frame(250);
 assert.equal(b.alive,true);
 assert.ok(b.x>a.x,"defender should return ahead of the advancing fencer");
});
test("wilds and clouds include traversable hazards rather than just paintings",()=>{
 const g=boot();const terrain=g.window.FencingTerrain;
 assert.equal(terrain.isGap("wilds",-587),true);
 assert.equal(terrain.isGap("castle",-587),false);
 assert.equal(terrain.isGap("clouds",250),true);
});
