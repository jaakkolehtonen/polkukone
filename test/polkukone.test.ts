import { Stack } from 'aws-cdk-lib';
import { PolkukoneStack } from '../lib/polkukone-stack';
import { Template } from 'aws-cdk-lib/assertions';

test('Stack should have S3 bucket, CloudFront distribution, Lambda function and API Gateway', () => {
    const stack = new Stack();
    new PolkukoneStack(stack, 'PolkukoneStack');

    const assert = Template.fromStack(stack);

    assert.resourceCountIs('AWS::S3::Bucket', 1);
    assert.resourceCountIs('AWS::CloudFront::Distribution', 1);
    assert.resourceCountIs('AWS::Lambda::Function', 1);
    assert.resourceCountIs('AWS::ApiGateway::RestApi', 1);
});
