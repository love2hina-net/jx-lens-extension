import { Renderer } from '@k8slens/extensions';
import React from 'react'

import { NoneIcon, BuildIcon } from './src/icon'
import { PipelineActivity } from './src/objects/pipeline-activity';
import { PipelineActivityPage } from './src/pages/pipeline-activity-page';
import { PipelineActivityDetails, PipelineActivityDetailsProps } from './src/pages/pipeline-activity-details';
import { PipelineRun } from './src/objects/pipeline-run';
import { PipelineRunDetails, PipelineRunDetailsProps } from './src/pages/pipeline-run-details';
import { JxRelationsDetails, JxRelationsDetailsProps } from './src/pages/jx-relations-details';

export default class JxExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: 'jx-pipelines',
      components: {
        Page: () => <PipelineActivityPage />
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

  // @ts-ignore: "KubeObjectDetailRegistration" uses unknown type in Generics.
  kubeObjectDetailItems = [
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        Details: (props: PipelineActivityDetailsProps) => <PipelineActivityDetails {...props} />
      }
    },
    {
      kind: PipelineRun.kind,
      apiVersions: ['tekton.dev/v1beta1'],
      components: {
        Details: (props: PipelineRunDetailsProps) => <PipelineRunDetails {...props} />
      }
    },
    ...JxRelationsDetails.JX_K8S_KIND.map((i) => {
      return {
        kind: i.kind,
        apiVersions: i.apiVersions,
        components: {
          Details: (props: JxRelationsDetailsProps) => <JxRelationsDetails {...props} />
        },
        priority: -100
      }
    })
  ]
}
