import { Renderer } from '@k8slens/extensions';
import moment from 'moment';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type PipelineActivityCoreStep = {
  name: string;
  description?: string;
  status?: string;
  startedTimestamp?: string;
  completedTimestamp?: string;
}

export type PipelineActivityPreviewStep = PipelineActivityCoreStep & {
  applicationURL?: string;
  environment?: string;
  pullRequestURL?: string;
}

export type PipelineActivityPromoteStep = PipelineActivityCoreStep & {
  environment?: string;
  pullRequest?: PipelineActivityCoreStep & {
    mergeCommitSHA?: string;
    pullRequestURL?: string;
  };
  update?: PipelineActivityCoreStep & {
    statuses?: {
      status?: string;
      url?: string;
    }[];
  };
  applicationURL?: string;
}

export type PipelineActivityStageStep = PipelineActivityCoreStep & {
  steps?: PipelineActivityCoreStep[];
}

export type PipelineActivityStep = {
  kind: string;
  preview?: PipelineActivityPreviewStep;
  promote?: PipelineActivityPromoteStep;
  stage?: PipelineActivityStageStep;
}

export type PipelineActivitySpec = {
  attachments?: {
    name?: string;
    urls?: string[];
  }[];
  author?: string;
  authorAvatarURL?: string;
  authorURL?: string;
  baseSHA?: string;
  batchPipelineActivity?: {
    batchBranchName?: string;
    batchBuildNumber?: string;
    pullRequestInfo?: {
      lastBuildNumberForCommit?: string;
      lastBuildSHA?: string;
      pullRequestNumber?: string;
    }[];
  };
  build?: string;
  buildLogsURL?: string;
  buildUrl?: string;
  completedTimestamp?: string;
  context?: string;
  gitBranch?: string;
  gitOwner?: string;
  gitRepository?: string;
  gitUrl?: string;
  lastCommitMessage?: string;
  lastCommitSHA?: string;
  lastCommitURL?: string;
  pipeline?: string;
  pullTitle?: string;
  releaseNotesURL?: string;
  startedTimestamp?: string;
  status?: string;
  message?: string;
  steps?: PipelineActivityStep[];
  version?: string;
}

export type PipelineActivityStatus = {
  version?: string;
}

export class PipelineActivity extends Renderer.K8sApi.KubeObject<
  NamespaceScopedMetadata,
  PipelineActivityStatus,
  PipelineActivitySpec
> {
  static readonly kind = 'PipelineActivity';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/jenkins.io/v1/pipelineactivities';

  get buildName(): string {
    const build = this.spec.build;
    const context = this.spec.context;

    return (build && context)?
      `#${build} ${context}` : build || context || '';
  }

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get pipelineDescription(): string {
    const s = this.spec;

    return (s)? `${s.gitOwner}/${s.gitRepository}/${s.gitBranch} ${this.buildName}` : '';
  }

  get createdTime(): any {
    return createdTime(this.metadata.creationTimestamp);
  }  
}

function createdTime(timestamp: string | undefined) {
  return (timestamp)? moment(timestamp) : null;
}

function dateFromNow(timestamp: string | undefined): string {
  return (timestamp)? moment(timestamp).fromNow(false) : '';
}
