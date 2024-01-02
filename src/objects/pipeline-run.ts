import { Renderer } from '@k8slens/extensions';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type PipelineTaskRun = {
  pipelineTaskName: string;
  status: {
    podName: string;
    steps: {
      name: string;
      container: string;
    }[];
  };
}

export type PipelineRunStatus = {
  taskRuns?: {
    [name: string]: PipelineTaskRun;
  };
};

export class PipelineRun extends Renderer.K8sApi.KubeObject<NamespaceScopedMetadata, PipelineRunStatus, {}> {
  static readonly kind = 'PipelineRun';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/tekton.dev/v1beta1/pipelineruns';
}
