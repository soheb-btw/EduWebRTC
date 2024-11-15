'use client';
import { useEffect, useReducer, useRef, useState } from "react";

export default function User() {
    // const [socket, setSocket] = useState<null | WebSocket>(null);
    const [peerConnection, setPeer] = useState<null | RTCPeerConnection>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = (message) => {
            console.log('receiver connected');
            socket.send(JSON.stringify({ type: 'receiver' }));
        }

        startReceiving(socket);
        // setSocket(socket);

    }, []);

    function startReceiving(socket: WebSocket) {
        const peerConnection = new RTCPeerConnection();

        peerConnection.ontrack = (event) => {
            console.log('on track');
            if (videoRef.current && event) {
                // Attach the received media stream to the video element
                videoRef.current.srcObject =  new MediaStream([event.track]);
            }
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }))
            }
        }

        setPeer(peerConnection);

        socket.onmessage = async (event) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'take-offer') {
                await peerConnection.setRemoteDescription(parsedData.sdp);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket?.send(JSON.stringify({ type: 'create-answer', sdp: peerConnection.localDescription }));
            } else if (parsedData.type === 'add-candidate') {
                peerConnection?.addIceCandidate(parsedData.candidate);
            }
        }
    }

    return <div>
        receiver
        <video
            ref={videoRef}
            autoPlay
            playsInline
            width="100%"
            height="auto"
            muted
        />
    </div>
}