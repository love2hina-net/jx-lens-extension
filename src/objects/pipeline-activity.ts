import { Renderer } from '@k8slens/extensions';

import { createdTime, dateFromNow } from '../common';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type PipelineActivityCoreStep = {
  name: string;
  description?: string;
  status?: string;
  startedTimestamp?: string;
  completedTimestamp?: string;
};

export type PipelineActivityPreviewStep = PipelineActivityCoreStep & {
  applicationURL?: string;
  environment?: string;
  pullRequestURL?: string;
};

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
};

export type PipelineActivityStageStep = PipelineActivityCoreStep & {
  steps?: PipelineActivityCoreStep[];
};

export type PipelineActivityStep = {
  kind: string;
  preview?: PipelineActivityPreviewStep;
  promote?: PipelineActivityPromoteStep;
  stage?: PipelineActivityStageStep;
};

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
};

export type PipelineActivityStatus = {
  version?: string;
};

export class PipelineActivity extends Renderer.K8sApi.KubeObject<
NamespaceScopedMetadata,
PipelineActivityStatus,
PipelineActivitySpec
> {
  static readonly kind = 'PipelineActivity';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/jenkins.io/v1/pipelineactivities';

  get buildName(): string {
    const { build, context } = this.spec;

    return (build && context) ? `#${build} ${context}` : build || context || '';
  }

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get pipelineDescription(): string {
    return `${this.spec.gitOwner}/${this.spec.gitRepository}/${this.spec.gitBranch} ${this.buildName}`;
  }

  get createdTime(): string {
    return createdTime(this.metadata.creationTimestamp);
  }

  /**
   * activityContainers returns an array of pipeline steps in order
   */
  get activityContainers(): PipelineActivityCoreStep[] {
    const answer: PipelineActivityCoreStep[] = [];

    this.spec.steps?.forEach((step) => {
      const steps = step.stage?.steps;
      if (steps) {
        answer.push(...steps);
      }
    });

    return answer;
  }

  // TODO: BUG: 1つのアクティビティに対して、複数のPodが存在する場合があるので、正しくない
  get podFromActivity(): Renderer.K8sApi.Pod | undefined {
    const store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
    if (!store) {
      console.log('no store');
      return undefined;
    }
    if (!this.metadata.labels) {
      return undefined;
    }

    const namespace = this.getNs() || 'jx';
    const podName = this.metadata.labels['podName'];

    if (podName) {
      // console.log('looking up pod', podName, 'in namespace', namespace)
      return store.getByName(podName, namespace);
    }

    // lets use the selector to find the pod...
    const pods = store.getByLabel({
      branch: this.spec.gitBranch,
      build: this.spec.build,
      owner: this.spec.gitOwner,
      repository: this.spec.gitRepository,
    });
    return pods.find((pod) => {
      const labels = pod.metadata.labels;
      return labels && labels['jenkins.io/pipelineType'] != 'meta';
    });
  }

  static toContainerName(step: PipelineActivityCoreStep): string {
    return 'step-' + step.name.toLowerCase().split(' ').join('-');
  }
}
