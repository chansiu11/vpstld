// Optional Render multiplayer relay. Node 20+, npm install, npm start.
const {WebSocketServer}=require("ws");
const http=require("http");const port=process.env.PORT||10000;
const rooms=new Map();const httpServer=http.createServer((req,res)=>{res.writeHead(200,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"});res.end(JSON.stringify({ok:true,game:"Fencing Duel",rooms:rooms.size}))});
const wss=new WebSocketServer({server:httpServer,maxPayload:65536});
function send(ws,obj){if(ws?.readyState===1)ws.send(JSON.stringify(obj))}
function clean(ws){const room=rooms.get(ws.room);if(!room)return;room.players[ws.playerId]=null;const other=room.players[1-ws.playerId];if(other)send(other,{type:"opponent_left"});if(room.players.every(p=>!p))rooms.delete(ws.room)}
wss.on("connection",ws=>{ws.isAlive=true;ws.on("pong",()=>ws.isAlive=true);
ws.on("message",bytes=>{let msg;try{msg=JSON.parse(String(bytes))}catch{return}if(!msg||typeof msg!=="object")return;
if(msg.type==="join"){if(ws.room)return;const roomId=String(msg.room||"").trim().toUpperCase();if(!/^[A-Z0-9]{4,10}$/.test(roomId)){send(ws,{type:"error",message:"잘못된 방 코드"});return}
let room=rooms.get(roomId);if(!room){room={players:[null,null],stage:msg.stage||"castle"};rooms.set(roomId,room)}
let id=room.players.findIndex(v=>v===null);if(id===-1){send(ws,{type:"error",message:"방이 가득 찼습니다"});return}
ws.room=roomId;ws.playerId=id;room.players[id]=ws;send(ws,{type:"joined",playerId:id,stage:room.stage});if(room.players.every(Boolean))room.players.forEach(p=>send(p,{type:"start"}));return}
if(!ws.room)return;const room=rooms.get(ws.room);if(!room)return;const other=room.players[1-ws.playerId];
if(msg.type==="input"&&ws.playerId===1){const allowed=["left","right","up","down","attack","jump","throw"];const keys={};for(const name of allowed)keys[name]=msg.keys?.[name]===true;send(other,{type:"input",keys})}
if(msg.type==="state"&&ws.playerId===0){if(!Array.isArray(msg.players)||msg.players.length!==2)return;send(other,{type:"state",players:msg.players,camera:msg.camera,priority:msg.priority,round:msg.round,drops:Array.isArray(msg.drops)?msg.drops.slice(0,100):[],finished:!!msg.finished,elapsed:msg.elapsed})}
});
ws.on("close",()=>clean(ws));ws.on("error",()=>{});});
const interval=setInterval(()=>{for(const ws of wss.clients){if(!ws.isAlive){ws.terminate();continue;}ws.isAlive=false;ws.ping()}},30000);
wss.on("close",()=>clearInterval(interval));httpServer.listen(port,()=>console.log("Fencing Duel server running on "+port));