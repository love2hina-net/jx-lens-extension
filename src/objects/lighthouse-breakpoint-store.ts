import { Renderer } from '@k8slens/extensions';

import { LighthouseBreakpoint, LighthouseBreakpointFilter, BreakpointFilterMatches } from './lighthouse-breakpoint';

export class LighthouseBreakpointsApi extends Renderer.K8sApi.KubeApi<LighthouseBreakpoint> {}

export const lighthouseBreakpointsApi = new LighthouseBreakpointsApi({
  objectConstructor: LighthouseBreakpoint,
});

export class LighthouseBreakpointsStore extends Renderer.K8sApi.KubeObjectStore<LighthouseBreakpoint> {
  constructor() {
    super(lighthouseBreakpointsApi);
  }

  getBreakpointForActivity(filter: LighthouseBreakpointFilter): LighthouseBreakpoint | undefined {
    return this.items.find((item) => BreakpointFilterMatches(filter, item.spec.filter));
  }
}

export const lighthouseBreakpointsStore = new LighthouseBreakpointsStore();
Renderer.K8sApi.apiManager.registerStore(lighthouseBreakpointsStore);
