import { Renderer } from '@k8slens/extensions';

import { PipelineActivity } from './pipeline-activity';

export class PipelineActivityApi extends Renderer.K8sApi.KubeApi<PipelineActivity> {}

export const pipelineActivitiesApi = new PipelineActivityApi({
  objectConstructor: PipelineActivity,
});

export class PipelineActivitiesStore extends Renderer.K8sApi.KubeObjectStore<PipelineActivity> {
  constructor() {
    super(pipelineActivitiesApi);
  }
}

export const pipelineActivitiesStore = new PipelineActivitiesStore();
Renderer.K8sApi.apiManager.registerStore(pipelineActivitiesStore);
