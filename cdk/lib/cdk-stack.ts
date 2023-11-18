import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { AccountRootPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';


export class RsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "RsBucket", {
      versioned: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const oai = new OriginAccessIdentity(this, "RsOriginAccessIdentity", {
      comment: "Cloudfront OAI"
    });
 
    bucket.grantRead(oai);

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [new AccountRootPrincipal()]
      })
    );

    const distribution = new CloudFrontWebDistribution(
      this,
      "RsCloudFrontWebDistribution",
      {
        originConfigs: [
          {
            behaviors: [
              {
                isDefaultBehavior: true
              }
            ],
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai
            }
          }
        ],
        comment: "Distribution"
      }
    );

    new BucketDeployment(this, "RsBucketDeployment", {
      sources: [Source.asset("../dist")],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ["/*"]
    });
  }
}