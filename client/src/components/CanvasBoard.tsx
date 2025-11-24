import React, { useEffect, useRef, useState } from 'react';

interface CanvasBoardProps {
    dataChannel: RTCDataChannel | null;
    isControlEnabled: boolean;
    width: number;
    height: number;
    pageIndex: number;
}

interface DrawPoint {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    color: string;
    width: number;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
    dataChannel,
    isControlEnabled,
    width,
    height,
    pageIndex
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    // Store drawing history per page
    const historyRef = useRef<Record<number, DrawPoint[]>>({});

    // Redraw when page changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Redraw history for this page
        const pageHistory = historyRef.current[pageIndex] || [];
        pageHistory.forEach(point => {
            drawLine(ctx, point);
        });
    }, [pageIndex, width, height]);

    useEffect(() => {
        if (!dataChannel) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'draw') {
                    const { point, page } = data;

                    // Add to history
                    if (!historyRef.current[page]) {
                        historyRef.current[page] = [];
                    }
                    historyRef.current[page].push(point);

                    // If drawing is for current page, render it
                    if (page === pageIndex) {
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) drawLine(ctx, point);
                        }
                    }
                } else if (data.type === 'clear') {
                    // Handle clear if needed (per page or global?)
                }
            } catch (e) {
                // Ignore
            }
        };

        dataChannel.addEventListener('message', handleMessage);
        return () => {
            dataChannel.removeEventListener('message', handleMessage);
        };
    }, [dataChannel, pageIndex]);

    const drawLine = (ctx: CanvasRenderingContext2D, point: DrawPoint) => {
        ctx.beginPath();
        ctx.moveTo(point.prevX, point.prevY);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = point.color;
        ctx.lineWidth = point.width;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const draw = (point: DrawPoint, emit: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawLine(ctx, point);

        // Add to local history
        if (!historyRef.current[pageIndex]) {
            historyRef.current[pageIndex] = [];
        }
        historyRef.current[pageIndex].push(point);

        if (emit && dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify({
                type: 'draw',
                point,
                page: pageIndex
            }));
        }
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isControlEnabled) return;
        setIsDrawing(true);
        const coords = getCoordinates(e);
        if (coords) lastPoint.current = coords;
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPoint.current = null;
    };

    const moveDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isControlEnabled || !lastPoint.current) return;
        const coords = getCoordinates(e);
        if (!coords) return;

        const point: DrawPoint = {
            x: coords.x,
            y: coords.y,
            prevX: lastPoint.current.x,
            prevY: lastPoint.current.y,
            color: 'red',
            width: 2
        };

        draw(point, true);
        lastPoint.current = coords;
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={moveDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={moveDrawing}
        />
    );
};
