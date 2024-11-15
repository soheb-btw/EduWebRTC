'use client'
import { useEffect, useState } from "react"

export default function Admin() {
    const [socket, setSocket] = useState<null | WebSocket>(null);
    const [peer, setPeer] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = (message) => {
            socket.send(JSON.stringify({ type: 'sender' }));
        }

        sets

    }, []);

    const startVideoConnectoin = async () => {
        const peerConnection = new RTCPeerConnection();
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket?.send({ type: 'create-offer', payload: { stp: peerConnection.localDescription } });
    }

    return <div>admin</div>
}