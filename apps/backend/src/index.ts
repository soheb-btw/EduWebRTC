import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const room = new Map<string,{admin: WebSocket, students: WebSocket[]}>();
let sender: null | WebSocket;
let receiver: null | WebSocket;

wss.on('connection', (ws) => {

    ws.on('message', (message: any) => {
        const parsedData = JSON.parse(message);
        switch (parsedData.type) {
            case 'sender': {
                sender = ws;
                // room.set(parsedData.payload.classId, {admin: ws, students: []});
                break
            }
            case 'receiver': {
                receiver = ws;
                // if(!room.has(parsedData.payload.classId)) return ws.send('no class exists');
                // const lecture = room.get(parsedData.payload.classId);
                // if(!lecture) return ws.send('no class exists');
               
                // if(lecture?.students.length === 0) {
                //     room.set(parsedData.payload.classId,{admin: lecture.admin, students: [ws]}); 
                //     return;
                // }
                // lecture.students.push(ws);
                break
            }
            case 'create-offer': {
                //create peer to peer connection with the sender
                if(!(ws === sender)) return;
                receiver?.send(JSON.stringify({type: 'take-offer', sdp:  parsedData.sdp }))
                break
            }
            case 'create-answer': {
                if(!(ws === receiver)) return;
                sender?.send(JSON.stringify({type: 'take-answer', sdp: parsedData.sdp}))
                break
            }
            case 'ice-candidate': {
                if(ws === sender) {
                    receiver?.send(JSON.stringify({type: 'add-candidate', candidate: parsedData.candidate}));
                } else if(ws === receiver) {
                    sender?.send(JSON.stringify({type: 'add-candidate', candidate: parsedData.candidate}))
                }
                break
            }
        }
    })

    // ws.send('connected to wss !!!');
})