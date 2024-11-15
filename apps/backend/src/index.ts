import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface IParsedData {
    type: string,
    payload: any
}

const room = new Map<string,{admin: WebSocket, students: WebSocket[]}>();
let sender: null | WebSocket;
let receiver: null | WebSocket;

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        const parsedData: IParsedData = JSON.parse(message.toString());
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
                receiver?.send(JSON.stringify({type: 'take-offer', payload: parsedData.payload}))
                break
            }
            case 'create-answer': {
                if(!(ws === receiver)) return;
                sender?.send(JSON.stringify({type: 'take-answer', payload: parsedData.payload}))
                break
            }
            case 'ice-candidate': {
                if(ws === sender) {
                    receiver?.send(JSON.stringify({type: 'add-candidate', payload: parsedData.payload}));
                } else if(ws === receiver) {
                    sender?.send(JSON.stringify({type: 'add-candidate', payload: parsedData.payload}))
                }
                break
            }
        }
    })

    ws.send('connected to wss');
})