# John Mikhail Arazo — Portfolio

React + Vite + Framer Motion.

## Run
    npm install
    npm run dev

## Profile picture
Save your photo as `public/profile.jpg` (square image works best). Until then, your initials are shown.

## Edit content
All text (skills, experience, contact) lives in `src/data.js`.

## Build for hosting (Netlify, Vercel, GitHub Pages…)
    npm run build   # output in dist/

## Tools
- **PDF Editor** (`#/tools/pdf-editor`, under **Tools** in the nav): edit existing text, add text, images and a drawn, typed or uploaded (PNG/JPG) signature, then download the PDF. Add more tools to the `tools` list in `src/components/Navbar.jsx`. Runs fully in the browser with pdf.js (rendering) and pdf-lib (saving); code is in `src/tools/pdf/` and is lazy-loaded so it doesn't slow the portfolio down.
