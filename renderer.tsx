import { Renderer } from '@k8slens/extensions';
import React from 'react'

import { NoneIcon, BuildIcon } from './src/icon'
import { PipelineActivity } from './src/objects/pipeline-activity';
import { PipelineActivityPage } from './src/pages/pipeline-activity-page';
import { PipelineActivityDetails, PipelineActivityDetailsProps } from './src/pages/pipeline-activity-details';

export default class JxExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: 'jx-pipelines',
      components: {
        Page: () => <PipelineActivityPage extension={this} />
      }
    }
  ]

  clusterPageMenus = [
    {
      id: 'jx',
      title: 'Jenkins X',
      components: {
        Icon: BuildIcon
      }
    },
    {
      parentId: 'jx',
      id: 'jx-pipelines',
      title: 'Pipelines',
      components: {
        Icon: NoneIcon
      },
      target: { pageId: 'jx-pipelines' }
    }
  ]

  kubeObjectDetailItems = [
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        Details: (props: PipelineActivityDetailsProps) => <PipelineActivityDetails {...props} />
      }
    }
  ]

  async onActivate() {
    // console.log('hello world')
  }
}
