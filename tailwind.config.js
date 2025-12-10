/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable manual dark mode
    theme: {
        extend: {
            colors: {
                academic: {
                    dark: '#1c1917',   // Stone 900 (Dark Brownish Black)
                    light: '#fff1f2',  // Rose 50 (Very Light Pink background)
                    brown: '#451a03',  // Amber 950 (Deep Brown - Main text light mode)
                    pink: '#dc2626',   // Red 600 (Vibrant Red - Headings dark mode)
                    gold: '#b45309',   // Amber 700 (Brownish Gold)
                    accent: '#be123c', // Rose 700 (Deep Pink accent)
                    'text-dark': '#fce7f3', // Pink 100 (Readable light pink text for dark mode body)
                }
            },
            fontFamily: {
                serif: ['"Oswald"', 'sans-serif'], // Now using Oswald for headings
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
