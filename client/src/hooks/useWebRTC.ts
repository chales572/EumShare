import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SIGNALING_SERVER_URL = `http://${window.location.hostname}:3001`;

export interface WebRTCState {
    socket: Socket | null;
    peerConnection: RTCPeerConnection | null;
    dataChannel: RTCDataChannel | null;
    isConnected: boolean;
    isInitiator: boolean;
}

export const useWebRTC = (roomId: string) => {
    const [state, setState] = useState<WebRTCState>({
        socket: null,
        peerConnection: null,
        dataChannel: null,
        isConnected: false,
        isInitiator: false,
    });

    // We need to track remoteSocketId to send ICE candidates
    const remoteSocketId = useRef<string | null>(null);

    useEffect(() => {
        const socket = io(SIGNALING_SERVER_URL);

        const pcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        };

        const pc = new RTCPeerConnection(pcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate && remoteSocketId.current) {
                socket.emit('ice-candidate', {
                    target: remoteSocketId.current,
                    candidate: event.candidate,
                });
            }
        };

        pc.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            receiveChannel.addEventListener('message', (e) => {
                console.log('Received message:', e.data);
            });
            setState(prev => ({ ...prev, dataChannel: receiveChannel }));
        };

        socket.emit('join-room', roomId);

        socket.on('user-connected', (userId) => {
            console.log('User connected:', userId);
            remoteSocketId.current = userId;
            createOffer(userId);
        });

        socket.on('offer', async (payload) => {
            remoteSocketId.current = payload.caller;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', {
                target: payload.caller,
                sdp: answer
            });
            setState(prev => ({ ...prev, isConnected: true }));
        });

        socket.on('answer', async (payload) => {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            setState(prev => ({ ...prev, isConnected: true }));
        });

        socket.on('ice-candidate', async (payload) => {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        });

        const createOffer = async (targetUserId: string) => {
            const dc = pc.createDataChannel("chat");
            setState(prev => ({ ...prev, dataChannel: dc }));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('offer', {
                target: targetUserId,
                caller: socket.id,
                sdp: offer
            });
        };

        setState(prev => ({ ...prev, socket, peerConnection: pc }));

        return () => {
            socket.disconnect();
            pc.close();
        };
    }, [roomId]);

    return state;
};
