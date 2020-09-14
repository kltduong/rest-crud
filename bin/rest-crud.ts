#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RestCrudStack } from '../lib/rest-crud-stack';

const app = new cdk.App();
new RestCrudStack(app, 'RestCrudStack');
