import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { ActivityDetails, ActivityDetailsProps } from './src/components/activity-details';
import { ActivityPage } from './src/components/activity-page';
import { ActivityMenu, ActivityMenuProps } from './src/components/activity-menu';
import { PreviewPage } from './src/components/preview-page';
import { PreviewMenu, PreviewMenuProps } from './src/components/preview-menu';
import { Preview } from './src/objects/preview';
import { RepositoryPage } from './src/components/repository-page';
import { SourceRepository } from './src/objects/source-repository';
import { RepositoryMenu, RepositoryMenuProps } from './src/components/repository-menu';
import { Environment } from './src/objects/environment';
import { EnvironmentMenu, EnvironmentMenuProps } from './src/components/environment-menu';
import { EnvironmentPage } from './src/components/environment-page';
import { BreakpointPage } from './src/components/lighthouse-breakpoint-page';

import { NoneIcon, BuildIcon } from './src/icon'
import { PipelineActivity } from './src/objects/pipeline-activity';
import { PipelineActivityPage } from './src/components/pipeline-activity-page';
import { PipelineActivityDetails, PipelineActivityDetailsProps } from './src/components/pipeline-activity-details';
import { PipelineRun } from './src/objects/pipeline-run';
import { PipelineRunDetails, PipelineRunDetailsProps } from './src/components/pipeline-run-details';
import { JxRelationsDetails, JxRelationsDetailsProps } from './src/components/jx-relations-details';

export function JXIcon(props: Renderer.Component.IconProps) {
  const JXLogo = require(`!!raw-loader!./jx.svg`).default;

  return <Renderer.Component.Icon {...props} svg={JXLogo} tooltip='Jenkins X'/>
}

export default class JenkinsXExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: 'jx-pipelines',
      components: {
        Page: () => <PipelineActivityPage />
      }
    },
    {
      id: 'breakpoints',
      components: {
        Page: () => <BreakpointPage />,
        MenuIcon: JXIcon,
      }
    },
    {
      id: 'environments',
      components: {
        Page: () => <EnvironmentPage />,
        MenuIcon: JXIcon,
      }
    },
    {
      id: 'pipelines',
      components: {
        Page: () => <ActivityPage />,
        MenuIcon: JXIcon,
      }
    },
    {
      id: 'previews',
      components: {
        Page: () => <PreviewPage />,
        MenuIcon: JXIcon,
      }
    },
    {
      id: 'repositories',
      components: {
        Page: () => <RepositoryPage />,
        MenuIcon: JXIcon,
      }
    }
  ]

  clusterPageMenus = [
    {
      id: 'jenkins-x',
      title: 'Jenkins X',
      components: {
        Icon: JXIcon,
      }
    },
    {
      parentId: 'jenkins-x',
      id: 'jx-pipelines',
      title: 'Pipelines(origin)',
      components: {
        Icon: NoneIcon
      },
      target: { pageId: 'jx-pipelines' }
    },
    {
      id: 'jenkins-x/breakpoints',
      parentId: 'jenkins-x',
      target: {pageId: 'breakpoints'},
      title: 'Breakpoints',
      components: {
        Icon: NoneIcon,
      }
    },
    {
      id: 'jenkins-x/environments',
      parentId: 'jenkins-x',
      target: {pageId: 'environments'},
      title: 'Environments',
      components: {
        Icon: NoneIcon,
      }
    },
    {
      id: 'jenkins-x/pipelines',
      parentId: 'jenkins-x',
      target: {pageId: 'pipelines'},
      title: 'Pipelines',
      components: {
        Icon: NoneIcon,
      }
    },
    {
      id: 'jenkins-x/previews',
      parentId: 'jenkins-x',
      target: {pageId: 'previews'},
      title: 'Previews',
      components: {
        Icon: NoneIcon,
      }
    },
    {
      id: 'jenkins-x/repositories',
      parentId: 'jenkins-x',
      target: {pageId: 'repositories'},
      title: 'Repositories',
      components: {
        Icon: NoneIcon,
      }
    },
  ];

  // @ts-ignore: 'KubeObjectMenuRegistration' uses unknown type in Generics.
  kubeObjectMenuItems = [
    {
      kind: Environment.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: EnvironmentMenuProps) => <EnvironmentMenu {...props} />
      }
    },
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: ActivityMenuProps) => <ActivityMenu {...props} />
      }
    },
    {
      kind: Preview.kind,
      apiVersions: ['preview.jenkins.io/v1alpha1'],
      components: {
        MenuItem: (props: PreviewMenuProps) => <PreviewMenu {...props} />
      }
    },
    {
      kind: SourceRepository.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: RepositoryMenuProps) => <RepositoryMenu {...props} />
      }
    },
  ];

  // @ts-ignore: 'KubeObjectDetailRegistration' uses unknown type in Generics.
  kubeObjectDetailItems = [
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        Details: (props: ActivityDetailsProps) => <ActivityDetails {...props} />
      }
    },
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
