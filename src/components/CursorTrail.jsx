import React, { useEffect, useState } from 'react';

const CursorTrail = () => {
    const [trail, setTrail] = useState([]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setTrail((prev) => [
                { x: e.clientX, y: e.clientY, id: Date.now() },
                ...prev.slice(0, 15), // Keep last 15 points
            ]);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
            {trail.map((point, index) => (
                <div
                    key={point.id}
                    className="absolute rounded-full bg-radio-cyan"
                    style={{
                        left: point.x,
                        top: point.y,
                        width: `${(15 - index) * 0.5}px`, // dminishing size
                        height: `${(15 - index) * 0.5}px`,
                        opacity: (15 - index) / 15, // fading opacity
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.1s, height 0.1s, opacity 0.1s'
                    }}
                />
            ))}
        </div>
    );
};

export default CursorTrail;
