import { Renderer } from '@k8slens/extensions';

export class PipelineRun extends Renderer.K8sApi.KubeObject {
  static kind = 'PipelineRun';
  static namespaced = true;
  static apiBase = '/apis/tekton.dev/v1beta1/pipelineruns';

  apiVersion: string;
  kind: string;
  // default metadata
  // metadata: {};
  status: {

  };
  spec: {
    
  };
}
