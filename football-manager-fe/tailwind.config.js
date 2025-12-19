/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",                 // Phải có dòng này
    "./src/**/*.{js,ts,jsx,tsx}",   // QUAN TRỌNG NHẤT: Dòng này bảo Tailwind quét tất cả file trong thư mục src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}