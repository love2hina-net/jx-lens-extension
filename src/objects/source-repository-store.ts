import { Renderer } from '@k8slens/extensions';

import { SourceRepository } from './source-repository';

export class SourceRepositoriesApi extends Renderer.K8sApi.KubeApi<SourceRepository> {}

export const sourceRepositoriesApi = new SourceRepositoriesApi({
  objectConstructor: SourceRepository,
});

export class SourceRepositoriesStore extends Renderer.K8sApi.KubeObjectStore<SourceRepository> {
  constructor() {
    super(sourceRepositoriesApi);
  }
}

export const sourceRepositoriesStore = new SourceRepositoriesStore();
Renderer.K8sApi.apiManager.registerStore(sourceRepositoriesStore);
