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
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                    // Legacy Academy Colors (mapped to variables)
                    50: '#f5f7ff',
                    100: '#ebf0ff',
                    200: '#d6e0ff',
                    300: '#adc2ff',
                    400: '#8ba9ff',
                    500: '#5983ff',
                    600: '#3a5acc',
                    700: '#2d4299',
                    800: '#1f2e66',
                    900: '#111933',
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Níveis de Progressão (Legacy support)
                level: {
                    1: 'var(--color-level-1)',
                    2: 'var(--color-level-2)',
                    3: 'var(--color-level-3)',
                    4: 'var(--color-level-4)',
                },
                // Status
                success: 'var(--color-success)',
                warning: 'var(--color-warning)',
                error: 'var(--color-error)',
                info: 'var(--color-info)',
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
                    '0%': { boxShadow: '0 0 5px rgba(89, 131, 255, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(89, 131, 255, 0.8)' },
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
