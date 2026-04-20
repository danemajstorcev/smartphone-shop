NexPhone


Project Description:

NexPhone is a full-featured online smartphone shop. It simulates a real-world e-commerce experience for premium smartphones, allowing users to browse, filter, compare, and purchase devices through a polished and responsive interface.
The app includes user authentication (sign in and sign up), a secure multi-step checkout with payment options, and an AI-powered chatbot that helps users choose the right smartphone based on their needs, preferences, and budget. It also features a GSMArena-style comparison tool for detailed side-by-side device analysis.


Tech Stack / Built With:

- React
- TypeScript
- Vite
- CSS Modules
- Google Gemini API (AI Chatbot)


Features:

- Hero carousel with special offers and auto-play
- Full product catalog with 22 smartphones across all major brands
- Advanced filtering by brand, category, and price range
- Live search with instant dropdown results
- Product detail pages with image gallery, specs, reviews, and color picker
- GSMArena-style phone comparison tool (up to 4 devices side-by-side)
- Add to cart with slide-in cart drawer and quantity controls
- Favorites / wishlist system
- User authentication system (sign in & sign up with persistent sessions)
- Multi-step checkout with payment options (card payment or cash on delivery)
- AI-powered chatbot (NexBot) that helps users choose, compare, and recommend smartphones
- Fully responsive layout for desktop, tablet, and mobile
- Touch swipe support on carousel for mobile devices


Getting Started / Installation

- Clone the repository:
git clone https://github.com/danemajstorcev/smartphone-shop.git

- Navigate to the project folder:
cd smartphone-shop

- Install dependencies:
npm install

- Set up the AI chatbot (optional):

Create a .env file in the root of the project and add your Gemini API key.
Get a free key at: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

- Run the development server:
npm run dev

- Open in browser:
http://localhost:5173


Live Demo:

https://smartphone-shop-phi.vercel.app/