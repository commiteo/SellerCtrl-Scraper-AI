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
					foreground: '#FFFFFF',
					50: '#FFF7ED',
					100: '#FFEDD5',
					200: '#FED7AA',
					300: '#FDBA74',
					400: '#FB923C',
					500: '#FF7A00',
					600: '#EA580C',
					700: '#C2410C',
					800: '#9A3412',
					900: '#7C2D12'
				},
				secondary: {
					DEFAULT: '#1A1A1A',
					foreground: '#E0E0E0',
					50: '#F8FAFC',
					100: '#F1F5F9',
					200: '#E2E8F0',
					300: '#CBD5E1',
					400: '#94A3B8',
					500: '#64748B',
					600: '#475569',
					700: '#334155',
					800: '#1E293B',
					900: '#0F172A'
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
				},
				dropdown: {
					DEFAULT: '#2A2A2A',
					foreground: '#FFFFFF',
					hover: '#3A3A3A',
					active: '#FF7A00',
					'active-foreground': '#FFFFFF',
					border: '#404040',
					shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)'
				},
				success: {
					DEFAULT: '#10B981',
					foreground: '#FFFFFF',
					50: '#ECFDF5',
					100: '#D1FAE5',
					200: '#A7F3D0',
					300: '#6EE7B7',
					400: '#34D399',
					500: '#10B981',
					600: '#059669',
					700: '#047857',
					800: '#065F46',
					900: '#064E3B'
				},
				warning: {
					DEFAULT: '#F59E0B',
					foreground: '#FFFFFF',
					50: '#FFFBEB',
					100: '#FEF3C7',
					200: '#FDE68A',
					300: '#FCD34D',
					400: '#FBBF24',
					500: '#F59E0B',
					600: '#D97706',
					700: '#B45309',
					800: '#92400E',
					900: '#78350F'
				},
				error: {
					DEFAULT: '#EF4444',
					foreground: '#FFFFFF',
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B',
					900: '#7F1D1D'
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
