'use client'
import { Button } from "@repo/ui/button";
import { useEffect, useRef, useState } from "react"

export default function Admin() {
    const [socket, setSocket] = useState<null | WebSocket>(null);
    const [peer, setPeer] = useState<null | RTCPeerConnection>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = (message) => {
            socket.send(JSON.stringify({ type: 'sender' }));
        }


        setSocket(socket);
    }, []);


    const startVideoConnectoin = async () => {
        if (!socket) return;
        
        const peerConnection = new RTCPeerConnection();
        setPeer(peerConnection);

        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'take-answer') {
                debugger
                peerConnection?.setRemoteDescription(parsedData.sdp);
            } else if(parsedData.type === 'add-candidate'){
                peerConnection?.addIceCandidate(parsedData.candidate);
            }
        }

        peerConnection.onnegotiationneeded = async () => {
            if (!peerConnection) return;
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket?.send(JSON.stringify({ type: 'create-offer',  sdp: peerConnection.localDescription }));
        }

        peerConnection.onicecandidate = (event) => {
            if(event.candidate){
                socket.send(JSON.stringify({type: 'ice-candidate', candidate: event.candidate}))
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const video = stream.getVideoTracks()[0];
        if (video) {
            peerConnection.addTrack(video);
            if(!videoRef.current) return;
            videoRef.current.srcObject = stream;
        }
        

    }


    return <div>
        <Button onHandleClick={(startVideoConnectoin)} appName="test">Start video</Button>
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