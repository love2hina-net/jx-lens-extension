import { Renderer } from '@k8slens/extensions';

import { pipelineRunsStore } from './pipeline-run-store';
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

export type PipelineActivityTaskRunStep = PipelineActivityCoreStep & {
  podName: string;
  containerName: string;
};

export type PipelineActivityTaskRun = {
  pipelineTaskName: string;
  steps: PipelineActivityTaskRunStep[];
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

  private static getNormalizeName(name: string): string {
    // TODO: 正規化の仕様を確認する
    return name.toLowerCase().replace(/ /g, '-');
  }

  async getSteps(): Promise<PipelineActivityTaskRun[]> {
    const namespace = this.getNs() || 'jx';
    const jxId = this.getLabels().find((label) => label.startsWith('lighthouse.jenkins-x.io/id='));
    const result: PipelineActivityTaskRun[] = [];

    if (jxId) {
      await pipelineRunsStore.loadAll({ namespaces: [namespace] });
      const pipelineRun = pipelineRunsStore.getByLabel([jxId])?.[0];
      if (pipelineRun) {
        this.spec.steps?.forEach((step) => {
          // TODO: このステップとPipeleineRunは対応するかは不明(要調査)
          const current = Object.entries(pipelineRun.status?.taskRuns ?? []).find(([_, i]) => {
            return i.status.steps.every((j) => step.stage?.steps?.some((k) => PipelineActivity.getNormalizeName(k.name) == j.name));
          })?.[1];
          if (current) {
            const steps: PipelineActivityTaskRunStep[] = step.stage?.steps?.map((i) => {
              const step = current.status.steps.find((j) => j.name == PipelineActivity.getNormalizeName(i.name));
              if (!step) {
                throw new Error('');
              }
              return {
                ...i,
                podName: current.status.podName,
                containerName: step.container,
              };
            }) ?? [];

            result.push({
              pipelineTaskName: current.pipelineTaskName,
              steps: steps,
            });
          }
        });
      }
    }

    return result;
  }

  async getPodFromStep(step: PipelineActivityTaskRunStep):
  Promise<[Renderer.K8sApi.Pod | undefined, Renderer.K8sApi.IPodContainer | undefined]> {
    const store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
    if (!store) {
      throw new Error('Unexpected error: could not find pods store.');
    }
    const pod = store.getByName(step.podName, this.getNs());
    const container = pod?.spec.containers?.find((i) => i.name == step.containerName);
    return pod && container ? [pod, container] : [undefined, undefined];
  }
}
