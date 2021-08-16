import { Renderer } from "@k8slens/extensions";
import { Breakpoint } from "./breakpoint";

export class BreakpointsApi extends Renderer.K8sApi.KubeApi<Breakpoint> {
}
export const breakpointsApi = new BreakpointsApi({
  objectConstructor: Breakpoint
});

export class BreakpointsStore extends Renderer.K8sApi.KubeObjectStore<Breakpoint> {
  api = breakpointsApi
}

export const breakpointsStore = new BreakpointsStore();
Renderer.K8sApi.apiManager.registerStore(breakpointsStore);
