# Pika H3 Flex Studio

Mobile-friendly web interface for the public `Pika-Labs/pika-h3-flex` Hugging Face Space.

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.

## Deploy with Render
1. Upload this project to a GitHub repository.
2. Sign in to Render and choose **New > Web Service**.
3. Connect the repository. Render can use `render.yaml` automatically.
4. Deploy, then open the generated `*.onrender.com` address on your phone.

## Important
- This project is an unofficial client, not affiliated with Pika Labs or Hugging Face.
- The app proxies generation and file uploads to the public Hugging Face Space.
- The Space's availability, queue, limits, and output behavior can change. The integration has not been live-tested from this environment.
- No Hugging Face token is embedded in the project. Do not add private tokens to frontend code.
