# Polkukone

The application is built using the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) and is deployed using the [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/).

> Project was initially created using the `cdk init polkukone --language typescript` command.
>
> Original `README.md` file is available for reference as [`README-CDK.md`](README-CDK.md).

## Packages

For package specific instructions, you can refer to the following `README.md` files:

- [`packages/server/README.md`](packages/server/README.md) - [`@polkukone/server`](packages/server) is the [Node.js](https://nodejs.org/) application that provides the backend API for the [`PolkukoneStack`](lib/polkukone-stack.ts).
  - [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) is used to store the database credentials.
  - [AWS RDS](https://aws.amazon.com/rds/) is used to host the [MariaDB](https://mariadb.org/) database instance.
    - [Security group](https://docs.aws.amazon.com/vpc/latest/userguide/security-groups.html) is configured within [VPC](https://aws.amazon.com/vpc/) to only allow access from the [AWS Lambda](https://aws.amazon.com/lambda/) functions.
  - Lambda's are used to run the application and it's database migrations and seeds.
  - [AWS API Gateway](https://aws.amazon.com/api-gateway/) is used to serve the [Express.js](https://expressjs.com/) API.
- [`packages/client/README.md`](packages/client/README.md) - [`@polkukone/client`](packages/client) is the [Vue.js](https://vuejs.org/) application that provides the frontend UI for the `PolkukoneStack`.
  - [AWS S3](https://aws.amazon.com/s3/) is used to host the application.
  - [AWS CloudFront](https://aws.amazon.com/cloudfront/) is used to serve the application.
    - Cache invalidation is triggered automatically when the application is deployed.

These `README.md` files provide detailed description about the packages and their dependencies and how to run them locally.

## Requirements

- [XCode](https://developer.apple.com/xcode/) - `xcode-select --install`
- [Homebrew](https://brew.sh) - `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [Node.js](https://nodejs.org/) - `brew install node@18`
- [Visual Studio Code](https://code.visualstudio.com/) - `brew install visual-studio-code`
  - VS Code is **recommended** editor for the project.
  - Project ships with VS Code Workspace Settings located at [`.vscode/`](.vscode/).

## Prerequisites

You should already have [Git](https://git-scm.com/) installed on your machine to use [AWS CodeCommit](https://aws.amazon.com/codecommit/). You can verify the installation by running:

```sh
git --version
```

If Git is not installed, you can install it using Homebrew:

```sh
brew install git
```

### AWS CLI

Install and configure the [AWS CLI](https://aws.amazon.com/cli/) with your credentials:

```sh
brew install awscli
aws configure
```

You will be prompted for your Access Key ID, Secret Access Key, default region, and output format. Enter these accordingly.

### AWS CodeCommit

OS X includes a system-level Git credential store that might interfere with the AWS CLI's credential helper when attempting to connect to AWS CodeCommit repositories.

Insert following lines into your `~/.gitconfig` file and you're able to use the credential helper for AWS CodeCommit repositories and the `osxkeychain` helper for all other repositories:

```ini
[credential "https://git-codecommit.*.amazonaws.com"]
    helper = !aws codecommit credential-helper $@
    UseHttpPath = true
[credential "https://github.com"]
    helper = osxkeychain
[credential "https://gitlab.com"]
    helper = osxkeychain
```

## Setup

If the infrastructure has already been setup up using [AWS CDK](https://aws.amazon.com/cdk/), you can skip the [Infrastructure](#infrastructure) section and proceed directly to the [Deployment](#deployment) section.

> Infrastructure has been setup if the repository was cloned using the CodeCommit URL. In that case, the remote is already set to the CodeCommit repository and the infrastructure is most likely already deployed.

After inital deployment, the resources and services are updated using [AWS CodePipeline](https://aws.amazon.com/codepipeline/) and [AWS CodeBuild](https://aws.amazon.com/codebuild/). The pipelines are triggered by pushing changes to the `main` branch of the [AWS CodeCommit](https://aws.amazon.com/codecommit/) repository.

> `npm`/`yarn`/`pnpm` workspaces are not used currently. This is because lock file (`package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`) is needed for each service and currently there's no way to do that with workspaces properly (there's some hackish community implementations so we'll wait for official solution).
>
> Only downside is that we need to run `npm install` in each package directory separately and we don't get the benefit of hoisting dependencies to the root `node_modules` directory.

## Infrastructure

Run the following commands to deploy the infrastructure using AWS CDK.

Install AWS CDK:

```sh
npm install -g aws-cdk
```

Set up the AWS CDK Toolkit stack in your AWS account:

```sh
cdk bootstrap
```

Install dependencies:

```sh
npm install
```

Deploy the CDK stack:

```sh
cdk deploy
```

`CfnOutput` outputs resources and services that are deployed by the CDK stack. You're able to access these resources and services using the URL's printed in the output.

### Git Remote

Make sure your Git remote is set to the CodeCommit repository. HTTP & SSH clone URL's are printed in the output (`CfnOutput`) of the `cdk deploy` command.

> If you would want to use [GitHub](https://github.com/) instead of CodeCommit, you would need to change the `repository` property of the `CodeCommitSourceAction` in [`lib/polkukone-pipeline-stack.ts`](lib/polkukone-pipeline-stack.ts) to `GitHubSourceAction` and set origin remote to the GitHub repository URL.
>
> For [GitLab](https://gitlab.com/), you would need to set [repository mirroring](https://docs.gitlab.com/ee/user/project/repository/mirror/index.html) to the GitLab repository URL as there is no GitLab source action available in AWS CDK currently.

Run these commands from repository root:

```sh
# Remove the default remote
git remote remove origin

# Replace the URL with the one from the output of `cdk deploy`
git remote set-url origin https://git-codecommit.eu-central-1.amazonaws.com/v1/repos/polkukone
```

## Deployment

Push changes to the `main` branch of the CodeCommit repository and the pipeline will automatically deploy the changes to the resources and services.

## Known Issues

- Sequelize auto increment get's fucked up when importing from multiple CSV sources (final bulkCreate operation)
