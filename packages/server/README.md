# Polkukone Server

The `@polkukone/server` is a [Node.js](https://nodejs.org/) application that serves as the server component of the `polkukone` application. It provides RESTful APIs, handles database interactions, and supports migrations for maintaining database schema changes.

The main entry point of the server is located at `src/index.ts`, which serves as the Lambda handler for the server. The server utilizes [Express.js](https://expressjs.com/) to handle HTTP requests and responses. It also uses [Sequelize](https://sequelize.org/) to interact with the [MariaDB](https://mariadb.com/) database. The server is designed to run in the [AWS Lambda](https://aws.amazon.com/lambda/) environment, which is why it uses the [serverless-http](https://github.com/dougmoscrop/serverless-http) package to bridge the gap between Express.js and AWS Lambda.

In addition to the server Lambda handler, the application includes a migration Lambda handler implemented in `src/migrate.ts`. This handler is responsible for executing database migrations using the [Umzug](https://github.com/sequelize/umzug) package.

For local development, the server can be run using Express.js by executing `npm run dev` which runs the `src/index.local.ts` file using [nodemon](https://nodemon.io/). In this mode, the server listens on a specific port and can be accessed locally for testing and development purposes.

Similarly, the migration process can be executed locally by running `npm run migrate` which runs the `src/migrate.local.ts` file using `ts-node`.

[Dotenv](https://www.dotenv.org/) is used to load environment variables from the `.env` file in local development mode. Copy the `.env.example` file to `.env` and update the values as needed.

The server includes the following scripts:

* `test`: Runs the [Jest](https://jestjs.io/) test suite to execute the server's unit tests.
* `prebuild`: Performs cleanup by removing the `dist` directory before building.
* `build:index`: Uses esbuild to bundle and minify the server's main file (`src/index.ts`) into `dist/index.js`.
* `build:migrate`: Uses esbuild to bundle and minify the migration file (`src/migrate.ts`) into `dist/migrate.js`.
* `build`: Invokes the `build:index` and `build:migrate` scripts to build both the server and migration files.
* `postbuild`: Creates ZIP archives (`index.zip` and `migrate.zip`) of the built files in the `dist` directory.
* `start`: Starts the local server by running the compiled `dist/index.local.js` file using Node.js.
* `dev`: Runs the local server in development mode using nodemon, which automatically restarts the server when changes are detected in `src/index.local.ts`.
* `migrate`: Executes the migration process using `ts-node` to run the `src/migrate.local.ts` file.

> Server was initially created using the `npm init -y` command.
