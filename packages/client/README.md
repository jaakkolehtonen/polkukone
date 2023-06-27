# Polkukone Client

The `@polkukone/client` is a client-side application built with [Vue 3](https://vuejs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/). It serves as the frontend component of the `polkukone` application, providing a user-interface for interacting with the server's API.

The application utilizes [Vue Router](https://router.vuejs.org/) for managing client-side routing and [Axios](https://axios-http.com/) for making HTTP requests to the server's API endpoints. The UI styling is done using the [Bulma](https://bulma.io/) CSS framework, which provides a responsive and modern design.

[Dotenv](https://www.dotenv.org/) is used to load environment variables from the `.env` file in local development mode. Copy the `.env.example` file to `.env` and update the values as needed.

The client includes the following scripts:

* `dev`: Runs the development server using Vite.
* `build`: Builds the application for production using Vite.
* `preview`: Serves the production build locally using Vite's preview server.

> Client was initially created using the `npm create vite@latest client -- --template vue-ts` command.
>
> Original `README.md` file is available for reference as [`README-VITE.md`](README-VITE.md).
