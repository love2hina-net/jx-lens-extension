import { Renderer } from '@k8slens/extensions';

import { createdTime, dateFromNow } from '../common';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type EnvironmentSpec = {
  kind?: string;
  label?: string;
  namespace?: string;
  order?: number;
  promotionStrategy?: string;
  remoteCluster?: boolean;
  source?: {
    ref?: string;
    url?: string;
  };
};

export type EnvironmentStatus = Record<string, never>;

export class Environment extends Renderer.K8sApi.KubeObject<
NamespaceScopedMetadata,
EnvironmentStatus,
EnvironmentSpec
> {
  static readonly kind = 'Environment';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/jenkins.io/v1/environments';

  get sourceUrl(): string {
    return this.spec.source?.url ?? '';
  }

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get createdTime(): string {
    return createdTime(this.metadata.creationTimestamp);
  }
}
