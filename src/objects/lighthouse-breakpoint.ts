import { Renderer } from '@k8slens/extensions';

import { createdTime, dateFromNow } from '../common';

type NamespaceScopedMetadata = Renderer.K8sApi.NamespaceScopedMetadata;

export type LighthouseBreakpointFilter = {
  owner?: string;
  repository?: string;
  branch?: string;
  context?: string;
};

export type LighthouseBreakpointDebug = {
  breakpoint?: string[];
};

export type LighthouseBreakpointSpec = {
  filter?: LighthouseBreakpointFilter;
  debug?: LighthouseBreakpointDebug;
};

export type LighthouseBreakpointStatus = Record<string, never>;

export class LighthouseBreakpoint extends Renderer.K8sApi.KubeObject<
NamespaceScopedMetadata,
LighthouseBreakpointStatus,
LighthouseBreakpointSpec
> {
  static readonly kind = 'LighthouseBreakpoint';
  static readonly namespaced = true;
  static readonly apiBase = '/apis/lighthouse.jenkins.io/v1alpha1/lighthousebreakpoints';

  get createdAt(): string {
    return dateFromNow(this.metadata.creationTimestamp);
  }

  get createdTime(): string {
    return createdTime(this.metadata.creationTimestamp);
  }
}

// BreakpointFilterMatches returns true if this filter matches the given filter
export function BreakpointFilterMatches(a: LighthouseBreakpointFilter | undefined, b: LighthouseBreakpointFilter | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  if (a.owner && a.owner !== b.owner) {
    return false;
  }
  if (a.repository && a.repository !== b.repository) {
    return false;
  }
  if (a.branch && a.branch !== b.branch) {
    return false;
  }
  if (a.context && a.context !== b.context) {
    return false;
  }
  return true;
}
