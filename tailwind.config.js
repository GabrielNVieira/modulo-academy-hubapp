/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Academy Theme Colors
                primary: {
                    DEFAULT: '#06b6d4', // Ciano
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                accent: {
                    DEFAULT: '#7c3aed', // Roxo
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                // Níveis de Progressão
                level: {
                    1: '#06b6d4', // Explorador - Ciano
                    2: '#0891b2', // Conhecedor - Ciano médio
                    3: '#0e7490', // Especialista - Ciano escuro
                    4: '#164e63', // Mestre - Ciano muito escuro
                },
                // Status
                success: '#22c55e',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'level-up': 'levelUp 0.6s ease-out',
                'badge-unlock': 'badgeUnlock 0.8s ease-out',
                'xp-gain': 'xpGain 0.5s ease-out',
                'streak-fire': 'streakFire 0.4s ease-out',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                levelUp: {
                    '0%': { transform: 'scale(0.5)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                badgeUnlock: {
                    '0%': { transform: 'rotateY(0deg) scale(0)' },
                    '50%': { transform: 'rotateY(180deg) scale(1.2)' },
                    '100%': { transform: 'rotateY(360deg) scale(1)' },
                },
                xpGain: {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(-20px)', opacity: '0' },
                },
                streakFire: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
