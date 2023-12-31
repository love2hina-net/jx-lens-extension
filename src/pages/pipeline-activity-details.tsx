import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineActivity, PipelineActivityStep, PipelineActivityStageStep } from '../objects/pipeline-activity';

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export interface PipelineActivityDetailsProps extends Renderer.Component.KubeObjectDetailsProps<PipelineActivity> {
}

export class PipelineActivityDetails extends React.Component<PipelineActivityDetailsProps> {
  render() {
    const { object: pipelineActivity } = this.props;
    return (
      <div className='PipelineActivity'>
        <DrawerTitle children='Jenkins X Pipeline' />
        <DrawerItem name='Context'>
          { pipelineActivity.spec.context }
        </DrawerItem>
        <DrawerItem name='Pipeline'>
          { pipelineActivity.spec.pipeline }
        </DrawerItem>
        <DrawerItem name='Build Number'>
          { pipelineActivity.spec.build }
        </DrawerItem>
        <DrawerItem name='Started'>
          { pipelineActivity.spec.startedTimestamp }
        </DrawerItem>
        <DrawerItem name='Completed'>
          { pipelineActivity.spec.completedTimestamp }
        </DrawerItem>
        <DrawerItem name='Status'>
          { pipelineActivity.spec.status }
        </DrawerItem>
        <DrawerItem name='Message'>
          { pipelineActivity.spec.message }
        </DrawerItem>

        <DrawerTitle children='Git' />
        <DrawerItem name='URL'>
          { pipelineActivity.spec.gitUrl }
        </DrawerItem>
        <DrawerItem name='Owner'>
          { pipelineActivity.spec.gitOwner }
        </DrawerItem>
        <DrawerItem name='Repository'>
          { pipelineActivity.spec.gitRepository }
        </DrawerItem>
        <DrawerItem name='Branch'>
          { pipelineActivity.spec.gitBranch }
        </DrawerItem>
        <DrawerItem name='LastCommitSHA'>
          { pipelineActivity.spec.lastCommitSHA }
        </DrawerItem>
        <DrawerItem name='BaseSHA'>
          { pipelineActivity.spec.baseSHA }
        </DrawerItem>

        <DrawerTitle children='Steps' />
        {
          pipelineActivity.spec.steps.map(this.renderStep, this)
        }
      </div>
    )
  }

  private renderStep(step: PipelineActivityStep, index: number): React.JSX.Element {
    switch (step.kind.toLowerCase()) {
      case 'preview':
        return (
          <React.Fragment>
            <DrawerItem name={`${index + 1}: Preview`}>
              { step.preview.name }
            </DrawerItem>
            { /* TODO: render preview details */ }
          </React.Fragment>
        );
      case 'promote':
        return (
          <React.Fragment>
            <DrawerItem name={`${index + 1}: Promote`}>
              { step.promote.name }
            </DrawerItem>
            { /* TODO: render promote details */ }
          </React.Fragment>
        );
      case 'stage':
        return (
          <React.Fragment>
            <DrawerItem name={`${index + 1}: Stage`}>
              { step.stage.name }
            </DrawerItem>
            <div style={{ paddingLeft: '2em' }}>
              <DrawerItem name='Started'>
                { step.stage.startedTimestamp }
              </DrawerItem>
              <DrawerItem name='Completed'>
                { step.stage.completedTimestamp }
              </DrawerItem>
              <DrawerItem name='Status'>
                { step.stage.status }
              </DrawerItem>
              {
                step.stage.steps.map(this.renderStageStep, this)
              }
            </div>
          </React.Fragment>
        );
      default:
        return (
          <DrawerItem name={`Unknown type: ${step.kind}`} labelsOnly />
        );
    }
  }

  private renderStageStep(step: PipelineActivityStageStep, index: number): React.JSX.Element {
    return (
      <React.Fragment>
        <DrawerItem name={`${index + 1}: Step`}>
          { step.name }
        </DrawerItem>
        <div style={{ paddingLeft: '2em' }}>
          <DrawerItem name='Started'>
            { step.startedTimestamp }
          </DrawerItem>
          <DrawerItem name='Completed'>
            { step.completedTimestamp }
          </DrawerItem>
          <DrawerItem name='Status'>
            { step.status }
          </DrawerItem>
        </div>
      </React.Fragment>
    );
  }
}
