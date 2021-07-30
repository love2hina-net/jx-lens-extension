/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import React from "react";
import {Common, Renderer} from "@k8slens/extensions";
import {Activity} from "../activity";
import * as electron from "electron";

const {
  Component: {
    logTabStore,
    MenuItem,
    Icon,
  },
  Navigation,
} = Renderer;

const {
  Util,
} = Common;


export interface ActivityMenuProps extends Renderer.Component.KubeObjectMenuProps<Activity> {
}

export class ActivityMenu extends React.Component<ActivityMenuProps> {
  render() {
    const {object, toolbar} = this.props;

    let link = object.spec.gitUrl || "";
    return (
      <>
        <MenuItem onClick={Util.prevDefault(() => this.viewLogs())}>
          <Icon material="subject" interactive={toolbar} tooltip={toolbar && "View the pipeline logs"}/>
          <span className="title">Logs</span>
        </MenuItem>
        <MenuItem onClick={Util.prevDefault(() => this.openLink(link))}>
          <Icon svg="ssh" interactive={toolbar} tooltip={toolbar && "View git repository"}/>
          <span className="title">Repository</span>
        </MenuItem>
      </>
    );
  }

  async openLink(link: string) {
    Navigation.hideDetails();

    openExternalLink(link);
  }

  async viewLogs() {
    Navigation.hideDetails();

    const pa = this.props.object;
    const pod = podFromActivity(pa);
    console.log("found pod", pod);

    if (!pod) {
      return;
    }

    // TODO how to find the running container step?
    // lets find the running container...
    const container  = pod.spec.containers[0];
    
    logTabStore.createPodTab({
      selectedPod: pod,
      selectedContainer: container,
    });
  }
}

/**
 * openExternalLink opens the external browser link
 * @param link
 */
export function openExternalLink(link: string) {
  //console.log("openning link", link);
  window.setTimeout(() => {
    //console.log("starting to open link", link);
    electron.shell.openExternal(link);
    console.log("opened link", link);
  }, 1);
}


function podFromActivity(pa: Activity) {
  const podApi = Renderer.K8sApi.apiManager.getApi(api => api.kind === "Pod");
  if (!podApi) {
    console.log("no pod api");
  }
  //console.log("found pod api", podApi);

  let store = Renderer.K8sApi.apiManager.getStore(podApi);
  if (!store) {
    console.log("no store");
    return null;
  }

  if (!pa || !pa.metadata || !pa.metadata.labels) {
    return null;
  }
  let namespace = pa.metadata.namespace || "jx";

  if (pa.metadata && pa.metadata.labels) {
    let podName = pa.metadata.labels["podName"];
    if (podName) {
      //console.log("looking up pod", podName, "in namespace", namespace)
      return store.getByName(podName, namespace);
    }
  }
  let s = pa.spec;
  if (s) {
    // lets use the selector to find the pod...
    let pods = store.getByLabel(
      {
        branch: s.gitBranch,
        build: s.build,
        owner: s.gitOwner,
        repository: s.gitRepository,
      }
    );
    return pods.find((pod) => !pod.labels || pod.labels["jenkins.io/pipelineType"] != "meta");
  }
  return null;
}