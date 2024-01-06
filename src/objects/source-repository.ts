import { Renderer } from '@k8slens/extensions';

import { dateFromNow } from '../common';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type SourceRepositorySpec = {
  httpCloneURL?: string;
  org?: string;
  provider?: string;
  providerKind?: string;
  providerName?: string;
  repo?: string;
  url?: string;
};

export type SourceRepositoryStatus = {};

export class SourceRepository extends Renderer.K8sApi.KubeObject<
  NamespaceScopedMetadata,
  SourceRepositoryStatus,
  SourceRepositorySpec
> {
  static readonly kind = 'SourceRepository'
  static readonly namespaced = true
  static readonly apiBase = '/apis/jenkins.io/v1/sourcerepositories'

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get createdTime(): any {
    return this.createdTime(this.metadata.creationTimestamp);
  }
}
