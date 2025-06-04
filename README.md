[Rally Metrics](https://www.rallymetrics.com/) is an application that helps pickleball fans draft their fantasy MLP teams using AI-powered suggestions and real-time stats.

Growing up, I was an avid pickleball fan, who actively participated in fantasy pickleball with my close friends, but I realized that there weren't 
any websites that showed player stats in a clean, digestible way. I solved this problem by creating Rally Metrics, and I took it a step further by 
integrated Google's new Gemini API to produce AI-powered suggestions for fantasy drafting.

Timeline of my project:

1. Create a datascraper that uses Python libraries like pandas and selenium to collect data from the official [MLP Site](https://www.majorleaguepickleball.co/), convert that data into a CSV file, and upload it to a PostgreSQL database.
3. Developed a Springboot Application that handles the backend (player-searches, AI-suggestion logic & match predictor, etc...) of my website using Java.
4. I created a scheduler that runs my Python script every morning, and updates the info in my PostgreSQL database.
5. I used Next.Js and modern libraries such as HeroUI to create the frontend of my website. I primarily used TypeScript, but also incorporated JavaScript and CSS.
6. I deployed the backend of my website using Railway and the frontend using Vercel.

I created Rally Metrics to fuel my passion and serve the small, but growing pickleball community.
Whether you're a fantasy pickleball fanatic or just curious, I'm here to give you the edge.

Powered by [Vin](https://www.linkedin.com/in/vincent-pineda8/)
