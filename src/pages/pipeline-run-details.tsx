import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineRun, PipelineTaskRun } from '../objects/pipeline-run';

const {
  Component: {
    Button,
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export type PipelineRunDetailsProps = Renderer.Component.KubeObjectDetailsProps<PipelineRun>;

type PipelineRunDetailsState = {
  taskRuns: {
    [name: string]: {
      steps: {
        [name: string]: Renderer.K8sApi.Pod | undefined
      }
    }
  }
}

export class PipelineRunDetails extends React.Component<PipelineRunDetailsProps, PipelineRunDetailsState> {
  constructor(props: PipelineRunDetailsProps) {
    super(props);
    this.state = {
      taskRuns: {}
    };
  }

  async componentDidMount() {
    const newState: PipelineRunDetailsState = {
      taskRuns: {}
    };
    const namespace = this.props.object.metadata.namespace ?? '';

    // Podをロードする
    const podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi);
    if (podsStore) {
      await podsStore.loadAll({ namespaces: [namespace] });

      for (const [name, taskRun] of Object.entries(this.props.object.status?.taskRuns ?? {})) {
        const steps: { [name: string]: Renderer.K8sApi.Pod | undefined } = {};
        const pod = podsStore.getByName(taskRun.status.podName, namespace);

        for (const step of taskRun.status.steps) {
          steps[step.name] = pod;
        }
        newState.taskRuns[name] = { steps };
      }
      this.setState(newState);
    }
  }

  render() {
    return (
      <div className='PipelineRun'>
        <DrawerTitle children='Tekton Pipeline' />
        { Object.entries(this.props.object.status?.taskRuns ?? {}).map(this.renderTaskRun, this) }
      </div>
    );
  }

  private renderTaskRun([name, taskRun]: [string, PipelineTaskRun]): React.JSX.Element {
    return (
      <React.Fragment key={name}>
        <DrawerItem name='TaskRun'>
          { taskRun.pipelineTaskName }
        </DrawerItem>
        <div style={{ paddingLeft: '2em' }}>
          <DrawerItem name='Pod'>
            { taskRun.status.podName }
          </DrawerItem>
          <div style={{ paddingLeft: '2em' }}>
            { taskRun.status.steps.map((step) => {
              return (
                <React.Fragment key={step.container}>
                  <DrawerItem name='Step'>
                    { step.name }
                  </DrawerItem>
                  <div style={{ paddingLeft: '2em' }}>
                    <DrawerItem name='Container'>
                      { step.container }&nbsp;
                      <Button
                        disabled={this.state.taskRuns[name]?.steps[step.name] == undefined}
                        onClick={() => this.showLogs(this.state.taskRuns[name]?.steps[step.name], step.container)}>
                        Log
                      </Button>
                    </DrawerItem>
                  </div>
                </React.Fragment>
              );
            }) }
          </div>
        </div>
      </React.Fragment>
    );
  }

  private showLogs(pod: Renderer.K8sApi.Pod | undefined, container: string) {
    const selectedContainer = pod?.getAllContainers().find((c) => c.name == container);

    if (pod && selectedContainer) {
      Renderer.Navigation.hideDetails();
      Renderer.Component.logTabStore.createPodTab({
        selectedPod: pod,
        selectedContainer: selectedContainer,
      });
    }
    else {
      Renderer.Component.notificationsStore.add({
        message: `Container ${container} was not found, probably the pod was already expired.`,
        status: Renderer.Component.NotificationStatus.ERROR
      });
    }
  }
}
