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

import { Common, Renderer } from '@k8slens/extensions';
import React from 'react';
import { $$escape } from 'ts-macros';

import { PipelineActivity, PipelineActivityStep, PipelineActivityCoreStep } from '../objects/pipeline-activity';
import { lighthouseBreakpointsStore } from '../objects/lighthouse-breakpoint-store';
import { LighthouseBreakpoint, LighthouseBreakpointFilter } from '../objects/lighthouse-breakpoint';
import { If } from './utility';
import { openExternalLink } from '../common';

const {
  Component: {
    ConfirmDialog,
    createTerminalTab,
    logTabStore,
    terminalStore,
    Icon,
    MenuItem,
    SubMenu,
    StatusBrick,
  },
  Navigation,
} = Renderer;

const {
  Util,
} = Common;

function $if(condition: any, child: () => React.JSX.Element): any {
  return (condition) && $$escape!(child);
}

export type PipelineActivityMenuProps = Renderer.Component.KubeObjectMenuProps<PipelineActivity>;

export class PipelineActivityMenu extends React.Component<PipelineActivityMenuProps> {
  render() {
    const { object, toolbar } = this.props;

    const link = object.spec.gitUrl || '';
    const containers = object.activityContainers;

    const runningContainerStep = findLatestRunningContainerStep(containers, false);

    const menuLinks = renderMenuItems(object, toolbar);
    const breakpoint = breakpointFromActivity(object);

    return (
      <>
        { this.renderLogsMenu(containers, toolbar) }
        {
          containers.length > 0 && runningContainerStep && (
            <MenuItem>
              <Icon svg='ssh' interactive={toolbar} tooltip={toolbar && 'Pod Shell'}/>
              <span className='title'>Shell</span>
              {
                containers.length > 0 && runningContainerStep && (
                  <>
                    <Icon className='arrow' material='keyboard_arrow_right'/>
                    <SubMenu>
                      {
                        runningContainerStep && (
                          <MenuItem key={'latest-step-' + runningContainerStep}
                                    onClick={Util.prevDefault(() => this.execShell(runningContainerStep))}
                                    className='flex align-center'
                                    title={'open a shell in the latest pipeline step: ' + runningContainerStep}>
                            <StatusBrick/>
                            <span>latest step</span>
                          </MenuItem>
                        )
                      }
                      {
                        runningContainerStep && containers.length > 1 && (
                          <>
                            <MenuItem key={'-separator-'}
                                      className='flex align-center'>
                              <span></span>
                            </MenuItem>
                            {
                              containers.map(container => {
                                const name = toContainerName(container.name);

                                return (
                                  <MenuItem key={name} onClick={Util.prevDefault(() => this.execShell(name))}
                                            className='flex align-center'
                                            title='open a shell into this pipeline step'>
                                    <StatusBrick/>
                                    <span>{name}</span>
                                  </MenuItem>
                                );
                              })
                            }
                          </>
                        )
                      }
                    </SubMenu>
                  </>
                )
              }
            </MenuItem>
          )
        }
        {lighthouseBreakpointsStore.isLoaded && (
          <MenuItem>
            <Icon material='adb' interactive={toolbar} tooltip={toolbar && 'Pipeline breakpoint'}/>
            <span className='title'>Breakpoint</span>
            <>
              <Icon className='arrow' material='keyboard_arrow_right'/>
              <SubMenu>
                {breakpoint && (
                  <MenuItem onClick={Util.prevDefault(() => this.removeBreakpoint(breakpoint))}
                            title='Delete the breakpoint'>
                    <Icon material='delete' interactive={toolbar} tooltip='Delete'/>
                    <span className='title'>Remove</span>
                  </MenuItem>
                )}
                {!breakpoint && (
                  <MenuItem onClick={Util.prevDefault(() => this.addBreakpoint(object))}
                            title='Add breakpoint breakpoint'>
                    <Icon material='add' interactive={toolbar}/>
                    <span className='title'>Add</span>
                  </MenuItem>
                )}
              </SubMenu>
            </>
          </MenuItem>
        )}
        <MenuItem onClick={Util.prevDefault(() => this.openLink(link))} title='View git repository'>
          <Icon material='source' interactive={toolbar}/>
          <span className='title'>Repository</span>
        </MenuItem>
        {menuLinks}
      </>
    );
  }

  private renderLogsMenu(steps: PipelineActivityCoreStep[], toolbar: boolean | undefined): React.JSX.Element {
    const latestContainerName = findLatestRunningContainerStep(steps, true);

    return (
      <MenuItem
        disabled={steps.length == 0}>
        <Icon material='subject' interactive={toolbar} tooltip={toolbar && 'View the pipeline logs'}/>
        <span className='title'>Logs</span>

        <>
          <Icon className='arrow' material='keyboard_arrow_right'/>
          <SubMenu>
            { $if!(latestContainerName, () => (
              <MenuItem
                key={'latest-step-' + latestContainerName}
                onClick={Util.prevDefault(() => this.viewLogs(latestContainerName))}
                className='flex align-center'
                title={'view logs for the latest pipeline step: ' + latestContainerName}>
                <StatusBrick/>
                <span>latest step</span>
              </MenuItem>
            )) }
            { $if!(latestContainerName && steps.length > 1, () => (
              <>
                <MenuItem
                  key={'-separator-'}
                  className='flex align-center'>
                  <span></span>
                </MenuItem>
                {
                  steps.map(step => {
                    const name = toContainerName(step.name);

                    return (
                      <MenuItem
                        key={name}
                        onClick={Util.prevDefault(() => this.viewLogs(name))}
                        className='flex align-center'
                        title='view logs for this pipeline step'>
                        <StatusBrick/>
                        <span>{ name }</span>
                      </MenuItem>
                    );
                  })
                }
              </>
            )) }
          </SubMenu>
        </>
      </MenuItem>
    );
  }

  async openLink(link: string) {
    Navigation.hideDetails();

    openExternalLink(link);
  }

  async viewLogs(containerName: string) {
    Navigation.hideDetails();

    const pa = this.props.object;
    const pod = podFromActivity(pa);
    //console.log('found pod', pod);
    if (!pod) {
      console.log('could not find pod for PipelineActivity', pa);
      return;
    }

    const container = pod.spec.containers?.find((c) => c.name == containerName);
    if (!container) {
      console.log('could not find container', containerName);
      return;
    }

    logTabStore.createPodTab({
      selectedPod: pod,
      selectedContainer: container,
    });
  }

  async execShell(container?: string) {
    Navigation.hideDetails();

    const pa = this.props.object;
    const pod = podFromActivity(pa);
    console.log('found pod', pod);
    if (!pod) {
      return;
    }

    const containerParam = container ? `-c ${container}` : '';
    let command = `kubectl exec -i -t -n ${pod.getNs()} ${pod.getName()} ${containerParam} '--'`;

    if (window.navigator.platform !== 'Win32') {
      command = `exec ${command}`;
    }

    if (pod.getSelectedNodeOs() === 'windows') {
      command = `${command} powershell`;
    } else {
      command = `${command} sh -c 'clear; (bash || ash || sh)'`;
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`
    });

    terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id
    });
  }

  async removeBreakpoint(breakpoint: LighthouseBreakpoint) {
    ConfirmDialog.open({
      ok: () => this.doRemoveBreakpoint(breakpoint),
      labelOk: `Remove`,
      message: <div>Remove the Breakpoint <b>{breakpoint.metadata.name}</b>?</div>,
    });
  }

  private doRemoveBreakpoint(breakpoint: LighthouseBreakpoint) {
    return lighthouseBreakpointsStore.remove(breakpoint);
  }


  async addBreakpoint(pa: PipelineActivity) {
    ConfirmDialog.open({
      ok: () => this.doAddBreakpoint(pa),
      labelOk: `Add`,
      message: <div>Add a breakpoint for the Pipeline <b>{pa.metadata.name}</b>?</div>,
    });
  }

  async doAddBreakpoint(pa: PipelineActivity) {
    const ns = pa.metadata.namespace;
    const name = pa.metadata.name;
    const filter = activityToBreakpointFilter(pa);
    const bp = {
      spec: {
        filter: filter,
        debug: {
          breakpoint: ['onFailure'],
        }
      }
    }
    
    lighthouseBreakpointsStore.create({
      name: name,
      namespace: ns
    }, bp);
  }
}

export function podFromActivity(pa: PipelineActivity) {
  let store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
  if (!store) {
    console.log('no store');
    return null;
  }

  if (!pa || !pa.metadata || !pa.metadata.labels) {
    return null;
  }
  let namespace = pa.metadata.namespace || 'jx';

  if (pa.metadata && pa.metadata.labels) {
    let podName = pa.metadata.labels['podName'];
    if (podName) {
      //console.log('looking up pod', podName, 'in namespace', namespace)
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
    return pods.find((pod) => {
      const labels = pod.metadata.labels;
      return labels && labels['jenkins.io/pipelineType'] != 'meta';
    });
  }
  return null;
}

export function breakpointFromActivity(pa: PipelineActivity) {
  const filter = activityToBreakpointFilter(pa);
  return lighthouseBreakpointsStore.getBreakpointForActivity(filter);
}

export function activityToBreakpointFilter(pa: PipelineActivity): LighthouseBreakpointFilter {
  let ps = pa.spec;
  return {
    branch: ps.gitBranch,
    owner: ps.gitOwner,
    repository: ps.gitRepository,
    context: ps.context
  }
}

function findLatestRunningContainerStep(containers: PipelineActivityCoreStep[], useLastIfNotRunning: boolean): string {
  let last = '';
  if (containers) {
    for (const c of containers) {
      if (!c.completedTimestamp) {
        return toContainerName(c.name);
      }
      last = c.name;
    }
  }
  if (useLastIfNotRunning && last) {
    return toContainerName(last);
  }
  return '';
}

export function toContainerName(name: string) {
  return 'step-' + name.toLowerCase().split(' ').join('-');
}

// renderMenuItems returns the menu item links for an activity
function renderMenuItems(pa: PipelineActivity, toolbar?: boolean) {
  const links: any[] = [];

  if (!pa || !pa.spec) {
    return links;
  }
  let steps = pa.spec.steps;
  if (!steps || !steps.length) {
    return links;
  }
  const version = pa.spec.version;
  const releaseNotesURL = pa.spec.releaseNotesURL;
  if (version && releaseNotesURL) {
    links.push((
      <MenuItem onClick={Util.prevDefault(() => openExternalLink(releaseNotesURL))} title='view the release notes'>
        <Icon material='description' interactive={toolbar}/>
        <span className='title'>{version}</span>
      </MenuItem>
    ));
  }

  pa.spec.steps?.forEach((step: PipelineActivityStep) => {
    const promote = step.promote;
    if (promote) {
      const pr = promote.pullRequest;
      const prURL = (pr)? pr.pullRequestURL : undefined;
      let title = (pr)? pr.name : undefined;
      
      if (prURL != undefined) {
        let prName = 'PR'
        let i = prURL.lastIndexOf('/');
        if (i > 0 && i < prURL.length) {
          prName = prURL.substr(i + 1);
        }
        let env = promote.environment;
        if (env) {
          // TODO to title for env
          title = 'Promote to ' + env;
        }

        links.push((
          <MenuItem onClick={Util.prevDefault(() => openExternalLink(prURL))}
                    title='view the promote Pull Request'>
            <Icon material='code' interactive={toolbar}/>
            <span className='title'>{title}</span>
          </MenuItem>
        ));
      }
    }
    const preview = step.preview;
    if (preview) {
      const appURL = preview.applicationURL;
      if (appURL) {
        let title = preview.name;
        if (!title) {
          title = 'Preview'
        }
        links.push((
          <MenuItem onClick={Util.prevDefault(() => openExternalLink(appURL))}
                    title='View the preview environment application'>
            <Icon material='visibility' interactive={toolbar}/>
            <span className='title'>View Preview</span>
          </MenuItem>
        ));
      }
    }
  });
  return links;
}
