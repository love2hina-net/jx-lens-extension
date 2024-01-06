import { Renderer } from '@k8slens/extensions';

import { PipelineRun } from './pipeline-run';

export class PipelineRunApi extends Renderer.K8sApi.KubeApi<PipelineRun> {}

export const pipelineRunsApi = new PipelineRunApi({
  objectConstructor: PipelineRun,
});

export class PipelineRunsStore extends Renderer.K8sApi.KubeObjectStore<PipelineRun> {
  constructor() {
    super(pipelineRunsApi);
  }
}

export const pipelineRunsStore = new PipelineRunsStore();
Renderer.K8sApi.apiManager.registerStore(pipelineRunsStore);
