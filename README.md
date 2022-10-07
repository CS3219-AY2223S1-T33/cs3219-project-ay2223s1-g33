# PeerPrep (G33)

PeerPrep is a web application for collaborating on technical interview questions and challenges. Users can practice with other like-minded users on coding challenges and take each other to new heights through peer-learning. The collaborative nature of the application breaks the monotonous grind of improving technical skills, tailored to the user’s skills.

## Quickstart Steps
1. In the root of the project, run `npm i`.
2. Run `npm run-script init-permissions`.
3. Run `npm run-script gen-proto` to compile protocol buffer typescript files.
4. Configure the `.env` file for each microservice. Refer to `.env.sample` for the variables that need to be configured.
5. In the microservice folder, run `npm i`.
6. In the microservice folder, run `npm start`.

## Protocol Buffer Generation
1. In the root of the project, run `npm i`.
2. Then, run `npm run-script gen-proto`.

## Database Schema Synchronization
1. In the root of the project, run `npm i`.
2. Then, run `npm run-script sync-schema`.

## Frontend
1. In the root of the project, run `npm run-script gen-y-websocket`.
2. Go the the frontend using `cd frontend/`.
3. Install npm packages using `npm i`.
4. Run Frontend using `npm start`.
