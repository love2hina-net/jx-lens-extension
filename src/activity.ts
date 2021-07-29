import {Renderer} from "@k8slens/extensions";

export class Activity extends Renderer.K8sApi.KubeObject {
  static kind = "PipelineActivity"
  static namespaced = true
  static apiBase = "/apis/jenkins.io/v1/pipelineactivities"

  kind: string
  apiVersion: string
  metadata: {
    name: string;
    namespace: string;
    selfLink: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    labels: {
      [key: string]: string;
    };
    annotations: {
      [key: string]: string;
    };
  }
  spec: {
    build: string;
    context: string;
    gitBranch: string;
    gitOwner: string;
    gitRepository: string;
    gitUrl: string;
    lastCommitSHA: string;
    status: string;
    creationTimestamp: string;
    completedTimestamp: string;
  }

  get lastStepStatus(): string {
    return "Something";
  }

  get buildName(): string {
    let build = this.spec.build;
    let context = this.spec.context;
    if (build && context) {
      return "#" + build + " " + context;
    }
    return build || context || "";
  }
}