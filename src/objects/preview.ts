import { Renderer } from '@k8slens/extensions';

import { createdTime, dateFromNow } from '../common';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type PreviewSpec = {
  source?: {
    url?: string;
    cloneURL?: string;
    ref?: string;
    path?: string;
  };
  pullRequest?: {
    number?: number;
    owner?: string;
    repository?: string;
    url?: string;
    title?: string;
    description?: string;
    user?: {
      name?: string;
      username?: string;
      imageUrl?: string;
      linkUrl?: string;
    };
  };
  resources?: {
    name?: string;
    url?: string;
    namespace?: string;
  };
};

export type PreviewStatus = Record<string, never>;

export class Preview extends Renderer.K8sApi.KubeObject<
NamespaceScopedMetadata,
PreviewStatus,
PreviewSpec
> {
  static readonly kind = 'Preview';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/preview.jenkins.io/v1alpha1/previews';

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get createdTime(): string {
    return createdTime(this.metadata.creationTimestamp);
  }
}
