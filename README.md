# PeerPrep (G33)

PeerPrep is a web application for collaborating on technical interview questions and challenges. Users can practice with other like-minded users on coding challenges and take each other to new heights through peer-learning. The collaborative nature of the application breaks the monotonous grind of improving technical skills, tailored to the user’s skills.

## Repository Organization
The repository is organised as a mono-repository, with each service taking a sub-folder.

## Quickstart Steps
1. In the root of the project, run `npm run-script init`.
2. Look into the `config_env` folder and configure the secrets, using the samples provided. Remove the suffix .sample to use the environment files.
  2.1. The required environment files are `secrets-email`, `secrets-db`, `secrets-redis`, `secrets-signing`
3. Start the Docker-Compose Stack using `npm run-script up-core`.
  3.1. This will up all services except `execute-service`.
  3.2. To also run execute-service, configure the environment file `secrets-db-judge0`.
  3.3. Use `npm run-script up`. Note that the image for executor exceeds 10GB in size.

> :information_source: In order to use secure gRPC, you need to configure `secrets-grpc-cert.env`. you may use `npm run-script gen-certs` to obtain the self-signed certificates.

## Developer Extras
Some setup is required for development. Note that these steps are not required to run the application, since all generated files are committed to version control.

### Protocol Buffer Generation (Typescript)
1. In the root of the project, run `npm i`.
2. Then, run `npm run-script gen-proto`.

### Protocol Buffer Generation (Golang)
1. In the root of the project, run `npm i`.
2. Then, run `npm run-script gen-proto-go`.

> :warning: You will need Golang on your system to perform this step.

### Gateway Generation (Golang)
1. In the root of the project, run `npm i`.
2. Then, run `npm run-script gen-gateway`.

> :warning: You will need Golang on your system to perform this step.

### Running each Service
1. We reccomend using docker-compose! You can up a single service by appending the service to the command
  1.1. For example, to run user-service, `npm run-script up user-service`.
  1.2. If you want to run the service in Daemon mode (background), add the `-d` flag: `npm run-script up -- -d user-service`.
  1.3. If you want to force a rebuild, use `npm run-script up -- --build user-service`.

### Running each Service Natively
1. If you must run natively, you will require NodeJS and NPM for Typescript services, and Golang for Go services
  1.1. Each service's sub-directory contains a `.env.sample` file. You must configure it manually in order to run. You can follow the configuration used in the `config_env` folder.
2. Navigate into the service's subdirectory
3. For Typescript services, execute
  3.1. `npm i`
  3.1. `npm run-script build`
  3.2. `npm start`
4. For Golang servies, execute
  4.1. `make run`

### Running the Frontend
1. In the root of the project, run `npm run-script gen-y-websocket`.
2. Go the the frontend using `cd frontend/`.
3. Install npm packages using `npm i`.
4. Run Frontend using `npm start`.

### Running Tests (Natively)
1. Tests must be run natively, we do not support testing in Docker.
2. Navigate into the service's subdirectory
3. For Typescript services, execute
  3.1. `npm i`
  3.2. `npm test`
4. For Golang services, execute
  4.1. `make test`
