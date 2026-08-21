/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Scan the web app entry point
    './index.html',
    './main.tsx',
    './packages/ui/src/features/profile/ProfileStep1.tsx',
    
    // Scan all component files in the current app
    './src/**/*.{ts,tsx,js, jsx, html}',
    
    // CRITICAL: Scan all files in @workspace/ui package
    // This is the missing piece causing your utility classes to not compile
    "../../packages/ui/**/*.{js,ts,jsx,tsx, web.tsx}", 
    '../../packages/ui/src/**/*.{ts,tsx, web.tsx}',
    '../../packages/core/src/**/*.{ts,tsx, web.tsx}',
    "../ui/**/*.{js,ts,jsx,tsx}",
    // Include any other workspace packages that export components
    '../../packages/*/src/**/*.{ts,tsx, web.tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors matching your tokens.ts
        brand: {
          primary: '#0F62FE',    // goVoylo Blue
          secondary: '#111B24',  // Deep Slate
          success: '#24A148',
          danger: '#DA1E28',
        }
      },
      spacing: {
        // Sync with your tokens.ts spacing scale
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      fontSize: {
        // Sync with your tokens.ts typography
        caption: '12px',
        body: '14px',
        heading: '20px',
        title: '28px',
      }
    },
  },
  plugins: [],
};