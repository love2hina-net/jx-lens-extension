import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineActivity } from './src/objects/pipeline-activity';
import { Environment } from './src/objects/environment';
import { Preview } from './src/objects/preview';
import { SourceRepository } from './src/objects/source-repository';
import { PipelineRun } from './src/objects/pipeline-run';

import { PipelineActivityPage } from './src/components/pipeline-activity-page';
import { PipelineActivityDetails, PipelineActivityDetailsProps } from './src/components/pipeline-activity-details';
import { PipelineActivityMenu, PipelineActivityMenuProps } from './src/components/pipeline-activity-menu';
import { LighthouseBreakpointPage } from './src/components/lighthouse-breakpoint-page';
import { EnvironmentPage } from './src/components/environment-page';
import { EnvironmentMenu, EnvironmentMenuProps } from './src/components/environment-menu';
import { PreviewPage } from './src/components/preview-page';
import { PreviewMenu, PreviewMenuProps } from './src/components/preview-menu';
import { RepositoryPage } from './src/components/repository-page';
import { RepositoryMenu, RepositoryMenuProps } from './src/components/repository-menu';
import { PipelineRunDetails, PipelineRunDetailsProps } from './src/components/pipeline-run-details';
import { JxRelationsDetails, JxRelationsDetailsProps } from './src/components/jx-relations-details';

import JXLogo from './jx.svg';

function NoneIcon(_: Renderer.Component.IconProps): React.ReactElement | null {
  return null;
}

function JXIcon(props: Renderer.Component.IconProps): React.ReactElement | null {
  return (
    <Renderer.Component.Icon
      {...props}
      svg={JXLogo}
      tooltip='Jenkins X'
    />
  );
}

export default class JenkinsXExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: 'jx-pipelines',
      components: {
        Page: () => <PipelineActivityPage />,
      },
    },
    {
      id: 'jx-breakpoints',
      components: {
        Page: () => <LighthouseBreakpointPage />,
      },
    },
    {
      id: 'jx-environments',
      components: {
        Page: () => <EnvironmentPage />,
      },
    },
    {
      id: 'jx-previews',
      components: {
        Page: () => <PreviewPage />,
      },
    },
    {
      id: 'jx-repositories',
      components: {
        Page: () => <RepositoryPage />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: 'jenkins-x',
      title: 'Jenkins X',
      components: {
        Icon: JXIcon,
      },
    },
    {
      parentId: 'jenkins-x',
      id: 'jenkins-x/pipelines',
      title: 'Pipelines',
      components: {
        Icon: NoneIcon,
      },
      target: { pageId: 'jx-pipelines' },
    },
    {
      parentId: 'jenkins-x',
      id: 'jenkins-x/breakpoints',
      title: 'Breakpoints',
      components: {
        Icon: NoneIcon,
      },
      target: { pageId: 'jx-breakpoints' },
    },
    {
      parentId: 'jenkins-x',
      id: 'jenkins-x/environments',
      title: 'Environments',
      components: {
        Icon: NoneIcon,
      },
      target: { pageId: 'jx-environments' },
    },
    {
      parentId: 'jenkins-x',
      id: 'jenkins-x/previews',
      title: 'Previews',
      components: {
        Icon: NoneIcon,
      },
      target: { pageId: 'jx-previews' },
    },
    {
      parentId: 'jenkins-x',
      id: 'jenkins-x/repositories',
      title: 'Repositories',
      components: {
        Icon: NoneIcon,
      },
      target: { pageId: 'jx-repositories' },
    },
  ];

  // @ts-expect-error: 'KubeObjectMenuRegistration' uses unknown type in Generics.
  kubeObjectMenuItems = [
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: PipelineActivityMenuProps) => <PipelineActivityMenu {...props} />,
      },
    },
    {
      kind: Environment.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: EnvironmentMenuProps) => <EnvironmentMenu {...props} />,
      },
    },
    {
      kind: Preview.kind,
      apiVersions: ['preview.jenkins.io/v1alpha1'],
      components: {
        MenuItem: (props: PreviewMenuProps) => <PreviewMenu {...props} />,
      },
    },
    {
      kind: SourceRepository.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        MenuItem: (props: RepositoryMenuProps) => <RepositoryMenu {...props} />,
      },
    },
  ];

  // @ts-expect-error: 'KubeObjectDetailRegistration' uses unknown type in Generics.
  kubeObjectDetailItems = [
    {
      kind: PipelineActivity.kind,
      apiVersions: ['jenkins.io/v1'],
      components: {
        Details: (props: PipelineActivityDetailsProps) => <PipelineActivityDetails {...props} />,
      },
    },
    {
      kind: PipelineRun.kind,
      apiVersions: ['tekton.dev/v1beta1'],
      components: {
        Details: (props: PipelineRunDetailsProps) => <PipelineRunDetails {...props} />,
      },
    },
    ...JxRelationsDetails.JX_K8S_KIND.map((i) => {
      return {
        kind: i.kind,
        apiVersions: i.apiVersions,
        components: {
          Details: (props: JxRelationsDetailsProps) => <JxRelationsDetails {...props} />,
        },
        priority: -100,
      };
    }),
  ];
}
