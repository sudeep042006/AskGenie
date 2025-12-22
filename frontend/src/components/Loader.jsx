import React from 'react';

/**
 * A modern shimmer/skeleton loader inspired by Gemini/ChatGPT.
 * @param {string} type - 'line' (default) or 'circle'
 * @param {string} className - Additional classes
 */
const Loader = ({ type = 'line', count = 1, className = '' }) => {
    const items = Array.from({ length: count });

    if (type === 'circle') {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`w-full space-y-3 ${className}`}>
            {items.map((_, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-white/5 rounded-lg w-full h-8"
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
            ))}
        </div>
    );
};

export default Loader;
