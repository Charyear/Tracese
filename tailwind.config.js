/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,vue}'],
    theme: {
        extend: {
            colors: {
                morandi: {
                    blue: {
                        light: '#F0F4F8',
                        DEFAULT: '#A5C4D4',
                        dark: '#5C7C8A'
                    },
                    green: {
                        light: '#F1F7F4',
                        DEFAULT: '#ADC7B8',
                        dark: '#6E8B79'
                    },
                    pink: {
                        light: '#FBF2F2',
                        DEFAULT: '#E3B9BC',
                        dark: '#A67C80'
                    },
                    orange: {
                        light: '#FDF6F0',
                        DEFAULT: '#E9C6B1',
                        dark: '#AC8065'
                    },
                    purple: {
                        light: '#F7F3F9',
                        DEFAULT: '#D6C5D8',
                        dark: '#8E7B92'
                    },
                    cream: {
                        light: '#FAF7F2',
                        DEFAULT: '#ECC89C',
                        dark: '#B08E62'
                    },
                    gray: {
                        light: '#FAFAFB',
                        card: '#FFFFFF',
                        text: '#333333',
                        desc: '#999999',
                        border: '#E8E8E8',
                        darkbg: '#000000',
                        darkcard: '#111111',
                        darktext: '#F5F5DC',
                        darkdesc: '#888888',
                        darkborder: '#333333',
                        divider: '#F5F5F7',
                        darkdivider: '#222222'
                    }
                }
            },
            fontFamily: {
                display: ['Outfit', 'sf-pro-display', 'system-ui', 'sans-serif'],
                title: ['Outfit', 'sf-pro-text', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
                caption: ['Inter', 'system-ui', 'sans-serif']
            },
            borderRadius: {
                'app': '16rpx',
                'btn': '24rpx',
                'card': '32rpx',
                'sheet': '40rpx'
            },
            spacing: {
                'safe-nav': '88rpx',
                'safe-bottom': 'constant(safe-area-inset-bottom)'
            }
        }
    },
    plugins: [],
    corePlugins: {
        preflight: false
    }
}
