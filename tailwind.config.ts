import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		fontFamily: {
			'sans': ['Inter', 'Roboto', 'Open Sans', 'Arial', 'sans-serif'],
		},
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: '#2A2A2A',
				input: '#1F1F1F',
				ring: '#FF7A00',
				background: '#0D0D0D',
				foreground: '#E0E0E0',
				primary: {
					DEFAULT: '#FF7A00',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#1A1A1A',
					foreground: '#E0E0E0'
				},
				card: {
					DEFAULT: '#1F1F1F',
					foreground: '#E0E0E0'
				},
				sidebar: {
					DEFAULT: '#1A1A1A',
					foreground: '#E0E0E0',
					primary: '#FF7A00',
					'primary-foreground': '#FFFFFF',
					accent: '#0D0D0D',
					'accent-foreground': '#E0E0E0',
					border: '#2A2A2A',
					ring: '#FF7A00'
				}
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.25rem'
			},
			boxShadow: {
				card: "0 4px 40px 0 rgba(0,0,0,0.10)",
			},
			fontFamily: {
				'inter': ['Inter', 'Roboto', 'Open Sans', 'Arial', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
        plugins: [tailwindcssAnimate],
} satisfies Config;
