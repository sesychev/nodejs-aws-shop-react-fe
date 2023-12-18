#!/usr/bin/env node
import "source-map-support/register";
import { RsStack } from "../lib/cdk-stack";
import { App } from "aws-cdk-lib";

const app = new App();

new RsStack(app, "RsStack", {});

app.synth();
