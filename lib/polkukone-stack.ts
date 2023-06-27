import { CfnOutput, CfnOutputProps, Duration, RemovalPolicy, Size, Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaRestApi, LambdaRestApiProps } from 'aws-cdk-lib/aws-apigateway';
import { Distribution, DistributionProps } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BuildSpec, LinuxBuildImage, PipelineProject, PipelineProjectProps } from 'aws-cdk-lib/aws-codebuild';
import { Repository, RepositoryProps } from 'aws-cdk-lib/aws-codecommit';
import { Artifact, Pipeline, PipelineProps } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, CodeCommitSourceAction, S3DeployAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { AnyPrincipal, ManagedPolicy, PolicyStatement, PolicyStatementProps, Role, RoleProps, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function, FunctionProps, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseInstanceProps, MariaDbEngineVersion } from 'aws-cdk-lib/aws-rds';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketProps, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Secret, SecretProps } from 'aws-cdk-lib/aws-secretsmanager';
import { AwsCustomResource, AwsCustomResourcePolicy, AwsCustomResourceProps, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class PolkukoneStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const databaseUsername = 'admin';
        const databaseName = 'polkukone';
        const repositoryName = 'polkukone';

        // Create a secret for the AWS RDS database instance
        const rdsCredentialsSecret = new Secret(this, `${id}DatabaseCredentialsSecret`, {
            secretName: 'rdsCredentialsSecret',
            description: 'Credentials for the AWS RDS database instance',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: databaseUsername, dbname: databaseName }),
                generateStringKey: 'password',
                excludePunctuation: true,
            },
        } as SecretProps);

        // Create a VPC for the RDS instance
        const rdsVpc = new Vpc(this, `${id}RdsVpc`);

        // Create a security group for the RDS instance
        const rdsSecurityGroup = new SecurityGroup(this, `${id}DatabaseSecurityGroup`, {
            vpc: rdsVpc,
            description: 'Allow SQL traffic',
            allowAllOutbound: true,
        });

        // Allow SQL traffic from the VPC
        rdsSecurityGroup.addIngressRule(Peer.ipv4(rdsVpc.vpcCidrBlock), Port.tcp(3306));
        rdsSecurityGroup.addIngressRule(Peer.ipv4('85.76.109.66/32'), Port.tcp(3306));

        // Create the RDS instance
        const rdsInstance = new DatabaseInstance(this, `${id}DatabaseInstance`, {
            engine: DatabaseInstanceEngine.mariaDb({
                version: MariaDbEngineVersion.VER_10_6_12,
            }),
            credentials: Credentials.fromPassword(databaseUsername, rdsCredentialsSecret.secretValueFromJson('password')),
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            vpc: rdsVpc,
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC,
            },
            databaseName: databaseName,
            securityGroups: [rdsSecurityGroup],
        } as DatabaseInstanceProps);

        // The CodeCommit repository that will be the source of the pipeline
        const repository = new Repository(this, `${id}Repository`, {
            repositoryName: repositoryName,
        } as RepositoryProps);

        // Create a CodePipeline for the application
        new CodePipeline(this, `${id}AppPipeline`, {
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.codeCommit(repository, 'main'),
                commands: ['npm ci', 'npm run build', 'npx cdk synth'],
                primaryOutputDirectory: 'cdk.out',
            }),
        });

        // The CodeBuild role that will be used to build and deploy the applications
        const buildRole = new Role(this, `${id}CodeBuildRole`, {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
            managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')],
        } as RoleProps);

        // Create an S3 bucket to store the server's Lambda functions
        const serverBucket = new Bucket(this, `${id}ServerBucket`, {
            removalPolicy: RemovalPolicy.DESTROY,
        } as BucketProps);

        // Create a CodeBuild project for building the server's Lambda functions
        const serverBuild = new PipelineProject(this, `${id}ServerPipelineProject`, {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'runtime-versions': {
                            nodejs: '18.x',
                        },
                        commands: ['cd packages/server', 'npm install'],
                    },
                    build: {
                        commands: ['npm run build'],
                    },
                },
                artifacts: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'base-directory': 'packages/server/dist',
                    files: ['**/*'],
                },
            }),
            environment: {
                buildImage: LinuxBuildImage.STANDARD_7_0,
            },
            role: buildRole,
        } as PipelineProjectProps);

        // The output Artifact of the Source action
        const serverSourceOutput = new Artifact();

        // The output Artifact of the Build action
        const serverBuildOutput = new Artifact();

        // The pipeline that builds and deploys the server's Lambda functions
        new Pipeline(this, `${id}ServerPipeline`, {
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new CodeCommitSourceAction({
                            actionName: 'CodeCommit_Source',
                            repository: repository,
                            branch: 'main',
                            output: serverSourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new CodeBuildAction({
                            actionName: 'Build',
                            project: serverBuild,
                            input: serverSourceOutput,
                            outputs: [serverBuildOutput],
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new S3DeployAction({
                            actionName: 'DeployToS3',
                            input: serverBuildOutput,
                            bucket: serverBucket,
                        }),
                    ],
                },
            ],
        });

        // The Lambda function that will run the Sequelize.js database migrations
        const migrationFunction = new Function(this, `${id}MigrationFunction`, {
            runtime: Runtime.NODEJS_18_X,
            handler: 'migrate.handler',
            // code: Code.fromAsset(path.join(__dirname, '../packages/server/dist')),
            code: Code.fromBucket(serverBucket, 'migrate.zip'),
            environment: {
                DB_HOST: rdsInstance.instanceEndpoint.hostname,
                DB_USER: databaseUsername,
                DB_PASSWORD: rdsCredentialsSecret.secretValueFromJson('password').unsafeUnwrap(),
                DB_NAME: databaseName,
            },
            vpc: rdsVpc,
            timeout: Duration.seconds(10), // CURRENT_LAMBDA_FUNCTION_TIMEOUT
            securityGroups: [rdsSecurityGroup],
        } as FunctionProps);

        // Runs the Sequelize.js database migrations
        new AwsCustomResource(this, `${id}MigrationTrigger`, {
            onUpdate: {
                service: 'Lambda',
                action: 'invoke',
                parameters: {
                    FunctionName: migrationFunction.functionName,
                },
                physicalResourceId: PhysicalResourceId.of(migrationFunction.functionName),
            },
            policy: AwsCustomResourcePolicy.fromStatements([
                new PolicyStatement({
                    actions: ['lambda:InvokeFunction'],
                    resources: [migrationFunction.functionArn],
                }),
            ]),
        } as AwsCustomResourceProps);

        // The Lambda function that will run the Sequelize.js database seeders
        const seederFunction = new Function(this, `${id}SeederFunction`, {
            runtime: Runtime.NODEJS_18_X,
            handler: 'seed.handler',
            // code: Code.fromAsset(path.join(__dirname, '../packages/server/dist')),
            code: Code.fromBucket(serverBucket, 'seed.zip'),
            environment: {
                DB_HOST: rdsInstance.instanceEndpoint.hostname,
                DB_USER: databaseUsername,
                DB_PASSWORD: rdsCredentialsSecret.secretValueFromJson('password').unsafeUnwrap(),
                DB_NAME: databaseName,
            },
            vpc: rdsVpc,
            timeout: Duration.minutes(15), // CURRENT_LAMBDA_FUNCTION_TIMEOUT
            memorySize: 3008, // CURRENT_LAMBDA_FUNCTION_MEMORY_SIZE
            ephemeralStorageSize: Size.mebibytes(10240), // CURRENT_LAMBDA_FUNCTION_EPHEMERAL_STORAGE_SIZE
            securityGroups: [rdsSecurityGroup],
        } as FunctionProps);

        // Runs the Sequelize.js database seeders
        new AwsCustomResource(this, `${id}SeederTrigger`, {
            onCreate: {
                service: 'Lambda',
                action: 'invoke',
                parameters: {
                    FunctionName: seederFunction.functionName,
                },
                physicalResourceId: PhysicalResourceId.of(seederFunction.functionName),
            },
            policy: AwsCustomResourcePolicy.fromStatements([
                new PolicyStatement({
                    actions: ['lambda:InvokeFunction'],
                    resources: [seederFunction.functionArn],
                }),
            ]),
        } as AwsCustomResourceProps);

        // The Lambda function that will host the Express.js application
        const serverFunction = new Function(this, `${id}ServerFunction`, {
            runtime: Runtime.NODEJS_18_X,
            handler: 'index.handler',
            // code: Code.fromAsset(path.join(__dirname, '../packages/server/dist')),
            code: Code.fromBucket(serverBucket, 'index.zip'),
            environment: {
                DB_HOST: rdsInstance.instanceEndpoint.hostname,
                DB_USER: databaseUsername,
                DB_PASSWORD: rdsCredentialsSecret.secretValueFromJson('password').unsafeUnwrap(),
                DB_NAME: databaseName,
            },
            vpc: rdsVpc,
            timeout: Duration.seconds(10), // CURRENT_LAMBDA_FUNCTION_TIMEOUT
            securityGroups: [rdsSecurityGroup],
        } as FunctionProps);

        // The API Gateway that will trigger the Express.js application Lambda function
        const api = new LambdaRestApi(this, `${id}LambdaRestApi`, {
            handler: serverFunction,
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: Cors.DEFAULT_HEADERS,
                allowCredentials: true, // Required for cookies, authorization headers with HTTPS
            },
        } as LambdaRestApiProps);

        // The S3 bucket that will hold the Vue.js application static files
        const bucket = new Bucket(this, `${id}Bucket`, {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            // publicReadAccess: true,
            removalPolicy: RemovalPolicy.DESTROY,
            cors: [
                {
                    allowedOrigins: ['*'],
                    allowedMethods: [HttpMethods.GET],
                    allowedHeaders: ['*'],
                },
            ],
            blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Block public access to the S3 bucket
            accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL, // Access control for the S3 bucket
        } as BucketProps);

        // The S3 bucket policy that will allow CloudFront to access the Vue.js application static files
        const bucketPolicy = new PolicyStatement({
            // actions: ['s3:GetObject'],
            actions: ['s3:GetObject', 's3:PutObject'],
            resources: [bucket.bucketArn + '/*'],
            principals: [new AnyPrincipal()],
        } as PolicyStatementProps);

        bucket.addToResourcePolicy(bucketPolicy);

        // The CloudFront distribution that will serve the Vue.js application
        const distribution = new Distribution(this, `${id}Distribution`, {
            defaultBehavior: { origin: new S3Origin(bucket) },
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        } as DistributionProps);

        const distributionId = distribution.distributionId;

        // The CloudFront invalidation that will clear the cache when the Vue.js application is updated
        const invalidation = new AwsCustomResource(this, `${id}Invalidation${Date.now()}`, {
            onUpdate: {
                physicalResourceId: PhysicalResourceId.of(`${distributionId}${Date.now()}`),
                service: 'CloudFront',
                action: 'createInvalidation',
                parameters: {
                    DistributionId: distributionId,
                    InvalidationBatch: {
                        CallerReference: Date.now().toString(),
                        Paths: {
                            Quantity: 1,
                            Items: ['/*'],
                        },
                    },
                },
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        } as AwsCustomResourceProps);

        invalidation.node.addDependency(distribution);

        // The CodeBuild project that will build and deploy the Vue.js application
        const build = new PipelineProject(this, `${id}PipelineProject`, {
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'runtime-versions': {
                            nodejs: '18.x',
                        },
                        commands: ['npm install --prefix packages/client'],
                    },
                    build: {
                        commands: [`VITE_APP_API_URL=${api.url.slice(0, -1)} npm run build --prefix packages/client`],
                    },
                },
                artifacts: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'base-directory': 'packages/client/dist',
                    files: ['**/*'],
                },
            }),
            environment: {
                buildImage: LinuxBuildImage.STANDARD_7_0,
            },
            role: buildRole,
        } as PipelineProjectProps);

        // The output Artifact of the Source action
        const sourceOutput = new Artifact();

        // The output Artifact of the Build action
        const buildOutput = new Artifact();

        // The CodePipeline that will build and deploy the Vue.js application
        new Pipeline(this, `${id}Pipeline`, {
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new CodeCommitSourceAction({
                            actionName: 'CodeCommit_Source',
                            repository: repository,
                            branch: 'main',
                            output: sourceOutput,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new CodeBuildAction({
                            actionName: 'CodeBuild',
                            project: build,
                            input: sourceOutput,
                            outputs: [buildOutput],
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new S3DeployAction({
                            actionName: 'DeployToS3',
                            input: buildOutput,
                            bucket: bucket,
                        }),
                    ],
                },
            ],
        } as PipelineProps);

        // Prints out the domain name of the CloudFront distribution
        new CfnOutput(this, `${id}DistributionDomainName`, {
            value: distribution.distributionDomainName,
        } as CfnOutputProps);

        // Prints out the endpoint of the API Gateway
        // new CfnOutput(this, `${id}ApiGatewayUrl`, {
        //   value: `${api.url.slice(0, -1)}`,
        //   value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod`,
        // } as CfnOutputProps);

        // Prints out the database name
        new CfnOutput(this, `${id}DatabaseName`, {
            value: rdsInstance.instanceIdentifier,
        } as CfnOutputProps);

        // Prints out the database ARN
        new CfnOutput(this, `${id}DatabaseArn`, {
            value: rdsInstance.instanceArn,
        } as CfnOutputProps);

        // Prints out the database full ARN
        new CfnOutput(this, `${id}DatabaseFullArn`, {
            value: rdsInstance.instanceArn + ':' + rdsInstance.instanceIdentifier,
        } as CfnOutputProps);

        // Prints out the database endpoint
        new CfnOutput(this, `${id}DatabaseEndpoint`, {
            value: rdsInstance.instanceEndpoint.hostname,
        } as CfnOutputProps);

        // Prints out the CodeCommit repository HTTP clone URL
        new CfnOutput(this, `${id}RepoCloneUrlHttp`, {
            value: repository.repositoryCloneUrlHttp,
        } as CfnOutputProps);

        // Prints out the CodeCommit repository SSH clone URL
        new CfnOutput(this, `${id}RepoCloneUrlSsh`, {
            value: repository.repositoryCloneUrlSsh,
        } as CfnOutputProps);
    }
}
