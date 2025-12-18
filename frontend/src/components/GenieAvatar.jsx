import React from 'react';

/**
 * GenieAvatar Component
 * @param {string} state - 'idle' | 'thinking' | 'speaking'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const GenieAvatar = ({ state = 'idle', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} shrink-0`}>
            {/* Core Orb - Always present */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 ${state === 'speaking' ? 'animate-pulse' : ''}`}></div>

            {/* Inner Glow/Magic */}
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-tr from-white/90 to-transparent blur-[1px]"></div>

            {/* State: Thinking (Orbit/Ring) */}
            {state === 'thinking' && (
                <>
                    <div className="absolute inset-[-4px] rounded-full border-2 border-indigo-400/30 border-t-indigo-300 animate-spin"></div>
                    <div className="absolute inset-[-8px] rounded-full border border-purple-400/20 border-b-purple-300 animate-[spin_2s_linear_infinite_reverse]"></div>
                </>
            )}

            {/* State: Speaking (Pulse/Waves) */}
            {state === 'speaking' && (
                <div className="absolute inset-[-4px] rounded-full bg-purple-500/20 animate-ping"></div>
            )}

            {/* State: Idle (Gentle Float) */}
            {state === 'idle' && (
                <div className="absolute inset-0 rounded-full bg-white/10 animate-[pulse_3s_ease-in-out_infinite]"></div>
            )}
        </div>
    );
};

export default GenieAvatar;
