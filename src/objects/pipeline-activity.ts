import { Renderer } from '@k8slens/extensions';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type PipelineActivityStageStep = {
  completedTimestamp?: string;
  description?: string;
  name: string;
  startedTimestamp?: string;
  status?: string;
}

export type PipelineActivityStep = {
  kind: string;
  preview?: {
    applicationURL?: string;
    completedTimestamp?: string;
    description?: string;
    environment?: string;
    name: string;
    pullRequestURL?: string;
    startedTimestamp?: string;
    status?: string;
  };
  promote?: {
    applicationURL?: string;
    completedTimestamp?: string;
    description?: string;
    environment?: string;
    name: string;
    pullRequest?: {
      completedTimestamp?: string;
      description?: string;
      mergeCommitSHA?: string;
      name: string;
      pullRequestURL?: string;
      startedTimestamp?: string;
      status?: string;
    };
    startedTimestamp?: string;
    status?: string;
    update?: {
      completedTimestamp?: string;
      description?: string;
      name: string;
      startedTimestamp?: string;
      status?: string;
      statuses?: {
        status?: string;
        url?: string;
      }[];
    };
  };
  stage?: {
    completedTimestamp?: string;
    description?: string;
    name: string;
    startedTimestamp?: string;
    status?: string;
    steps?: PipelineActivityStageStep[];
  };
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
}
