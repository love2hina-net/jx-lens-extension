import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineRun, PipelineTaskRun } from '../objects/pipeline-run';

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export interface PipelineRunDetailsProps extends Renderer.Component.KubeObjectDetailsProps<PipelineRun> {
}

export class PipelineRunDetails extends React.Component<PipelineRunDetailsProps> {

  readonly pipelineRun: PipelineRun;

  constructor(props: PipelineRunDetailsProps) {
    super(props);
    this.pipelineRun = props.object;
  }

  render() {
    return (
      <div className='PipelineRun'>
        <DrawerTitle children='Tekton Pipeline' />
        { Object.entries(this.pipelineRun.status.taskRuns).map(this.renderTaskRun, this) }
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
        </div>
      </React.Fragment>
    );
  }
}
