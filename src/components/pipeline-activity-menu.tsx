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

import { PipelineActivity, PipelineActivityStep, PipelineActivityCoreStep } from '../objects/pipeline-activity';
import { lighthouseBreakpointsStore } from '../objects/lighthouse-breakpoint-store';
import { LighthouseBreakpoint, LighthouseBreakpointFilter } from '../objects/lighthouse-breakpoint';
import { $if } from './utility';
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

export type PipelineActivityMenuProps = Renderer.Component.KubeObjectMenuProps<PipelineActivity>;

export class PipelineActivityMenu extends React.Component<PipelineActivityMenuProps> {
  render() {
    const { object: activity, toolbar } = this.props;

    const link = activity.spec.gitUrl || '';
    const steps = activity.activityContainers;

    return (
      <>
        { this.renderLogsMenu(steps, toolbar) }
        { this.renderShellsMenu(steps, toolbar) }
        { this.renderBreakpointsMenu(activity, toolbar) }
        <MenuItem onClick={Util.prevDefault(() => this.openLink(link))} title='View git repository'>
          <Icon material='source' interactive={toolbar} />
          <span className='title'>Repository</span>
        </MenuItem>
        { this.renderMenuItems(activity, toolbar) }
      </>
    );
  }

  private renderLogsMenu(steps: PipelineActivityCoreStep[], toolbar: boolean | undefined): React.JSX.Element {
    const latestContainerName = findLatestRunningContainerStep(steps, true);

    return (
      <MenuItem disabled={steps.length == 0}>
        <Icon material='subject' interactive={toolbar} tooltip={toolbar && 'View the pipeline logs'} />
        <span className='title'>Logs</span>

        <>
          <Icon className='arrow' material='keyboard_arrow_right' />
          <SubMenu>
            { $if!(latestContainerName, () => (
              <MenuItem
                key={'latest-step-' + latestContainerName}
                onClick={Util.prevDefault(() => this.viewLogs(latestContainerName))}
                className='flex align-center'
                title={'view logs for the latest pipeline step: ' + latestContainerName}
              >
                <StatusBrick />
                <span>latest step</span>
              </MenuItem>
            )) }
            { $if!(latestContainerName && steps.length > 1, () => (
              <>
                <MenuItem
                  key='-separator-'
                  className='flex align-center'
                >
                  <span></span>
                </MenuItem>
                {
                  steps.map((step) => {
                    const name = PipelineActivity.toContainerName(step);

                    return (
                      <MenuItem
                        key={name}
                        onClick={Util.prevDefault(() => this.viewLogs(name))}
                        className='flex align-center'
                        title='view logs for this pipeline step'
                      >
                        <StatusBrick />
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

  private renderShellsMenu(steps: PipelineActivityCoreStep[], toolbar: boolean | undefined): React.JSX.Element {
    const runningContainerStep = findLatestRunningContainerStep(steps, false);

    return (
      <MenuItem disabled={steps.length == 0 || !runningContainerStep}>
        <Icon svg='ssh' interactive={toolbar} tooltip={toolbar && 'Pod Shell'} />
        <span className='title'>Shell</span>
        { $if!(steps.length > 0 && runningContainerStep, () => (
          <>
            <Icon className='arrow' material='keyboard_arrow_right' />
            <SubMenu>
              { $if!(runningContainerStep, () => (
                <MenuItem
                  key={'latest-step-' + runningContainerStep}
                  onClick={Util.prevDefault(() => this.execShell(runningContainerStep))}
                  className='flex align-center'
                  title={'open a shell in the latest pipeline step: ' + runningContainerStep}
                >
                  <StatusBrick />
                  <span>latest step</span>
                </MenuItem>
              )) }
              { $if!(runningContainerStep && steps.length > 1, () => (
                <>
                  <MenuItem
                    key='-separator-'
                    className='flex align-center'
                  >
                    <span></span>
                  </MenuItem>
                  {
                    steps.map((step) => {
                      const name = PipelineActivity.toContainerName(step);

                      return (
                        <MenuItem
                          key={name}
                          onClick={Util.prevDefault(() => this.execShell(name))}
                          className='flex align-center'
                          title='open a shell into this pipeline step'
                        >
                          <StatusBrick />
                          <span>{ name }</span>
                        </MenuItem>
                      );
                    })
                  }
                </>
              )) }
            </SubMenu>
          </>
        )) }
      </MenuItem>
    );
  }

  private renderBreakpointsMenu(activity: PipelineActivity, toolbar: boolean | undefined): React.JSX.Element {
    const breakpoint = breakpointFromActivity(activity);

    return (
      <MenuItem disabled={!lighthouseBreakpointsStore.isLoaded}>
        <Icon material='adb' interactive={toolbar} tooltip={toolbar && 'Pipeline breakpoint'} />
        <span className='title'>Breakpoint</span>
        { $if!(lighthouseBreakpointsStore.isLoaded, () => (
          <>
            <Icon className='arrow' material='keyboard_arrow_right' />
            <SubMenu>
              { $if!(breakpoint, () => (
                <MenuItem
                  onClick={Util.prevDefault(() => this.removeBreakpoint(breakpoint!))}
                  title='Delete the breakpoint'
                >
                  <Icon material='delete' interactive={toolbar} tooltip='Delete' />
                  <span className='title'>Remove</span>
                </MenuItem>
              )) }
              { $if!(!breakpoint, () => (
                <MenuItem
                  onClick={Util.prevDefault(() => this.addBreakpoint(activity))}
                  title='Add breakpoint breakpoint'
                >
                  <Icon material='add' interactive={toolbar} />
                  <span className='title'>Add</span>
                </MenuItem>
              )) }
            </SubMenu>
          </>
        )) }
      </MenuItem>
    );
  }

  // renderMenuItems returns the menu item links for an activity
  private renderMenuItems(activity: PipelineActivity, toolbar: boolean | undefined) {
    const links: React.JSX.Element[] = [];

    const steps = activity.spec.steps;
    if (steps && steps.length > 0) {
      const version = activity.spec.version;
      const releaseNotesURL = activity.spec.releaseNotesURL;

      if (version && releaseNotesURL) {
        links.push((
          <MenuItem
            onClick={Util.prevDefault(() => openExternalLink(releaseNotesURL))}
            title='view the release notes'
          >
            <Icon material='description' interactive={toolbar} />
            <span className='title'>{version}</span>
          </MenuItem>
        ));
      }

      steps.forEach((step: PipelineActivityStep) => {
        const promote = step.promote;
        if (promote) {
          const pr = promote.pullRequest;
          const prURL = pr?.pullRequestURL;
          let title = pr?.name;

          if (prURL) {
            const env = promote.environment;
            if (env) {
              // TODO to title for env
              title = 'Promote to ' + env;
            }

            links.push((
              <MenuItem
                onClick={Util.prevDefault(() => openExternalLink(prURL))}
                title='view the promote Pull Request'
              >
                <Icon material='code' interactive={toolbar} />
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
              title = 'Preview';
            }
            links.push((
              <MenuItem
                onClick={Util.prevDefault(() => openExternalLink(appURL))}
                title='View the preview environment application'
              >
                <Icon material='visibility' interactive={toolbar} />
                <span className='title'>View Preview</span>
              </MenuItem>
            ));
          }
        }
      });
    }

    return links;
  }

  async openLink(link: string) {
    Navigation.hideDetails();

    openExternalLink(link);
  }

  async viewLogs(containerName: string) {
    Navigation.hideDetails();

    const activity = this.props.object;
    const pod = activity.podFromActivity;
    // console.log('found pod', pod);
    if (!pod) {
      console.log('could not find pod for PipelineActivity', activity);
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

    const activity = this.props.object;
    const pod = activity.podFromActivity;
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
    }
    else {
      command = `${command} sh -c 'clear; (bash || ash || sh)'`;
    }

    const shell = createTerminalTab({
      title: `Pod: ${pod.getName()} (namespace: ${pod.getNs()})`,
    });

    terminalStore.sendCommand(command, {
      enter: true,
      tabId: shell.id,
    });
  }

  async removeBreakpoint(breakpoint: LighthouseBreakpoint) {
    ConfirmDialog.open({
      ok: () => this.doRemoveBreakpoint(breakpoint),
      labelOk: 'Remove',
      message: (
        <div>
          Remove the Breakpoint
          <b>{ breakpoint.metadata.name }</b>
          ?
        </div>),
    });
  }

  private doRemoveBreakpoint(breakpoint: LighthouseBreakpoint) {
    return lighthouseBreakpointsStore.remove(breakpoint);
  }

  async addBreakpoint(activity: PipelineActivity) {
    ConfirmDialog.open({
      ok: () => this.doAddBreakpoint(activity),
      labelOk: 'Add',
      message: (
        <div>
          Add a breakpoint for the Pipeline
          <b>{activity.metadata.name}</b>
          ?
        </div>),
    });
  }

  async doAddBreakpoint(activity: PipelineActivity) {
    const ns = activity.metadata.namespace;
    const name = activity.metadata.name;
    const filter = activityToBreakpointFilter(activity);
    const bp = {
      spec: {
        filter: filter,
        debug: {
          breakpoint: ['onFailure'],
        },
      },
    };

    lighthouseBreakpointsStore.create({
      name: name,
      namespace: ns,
    }, bp);
  }
}

function breakpointFromActivity(activity: PipelineActivity) {
  const filter = activityToBreakpointFilter(activity);
  return lighthouseBreakpointsStore.getBreakpointForActivity(filter);
}

function activityToBreakpointFilter(activity: PipelineActivity): LighthouseBreakpointFilter {
  const spec = activity.spec;
  return {
    branch: spec.gitBranch,
    owner: spec.gitOwner,
    repository: spec.gitRepository,
    context: spec.context,
  };
}

function findLatestRunningContainerStep(containers: PipelineActivityCoreStep[], useLastIfNotRunning: boolean): string {
  let latest = containers.find((c) => !c.completedTimestamp);
  if (useLastIfNotRunning && !latest) {
    latest = containers.at(-1);
  }
  return (latest) ? PipelineActivity.toContainerName(latest) : '';
}
