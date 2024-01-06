import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineActivity, PipelineActivityStep, PipelineActivityStageStep } from '../objects/pipeline-activity';

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export type PipelineActivityDetailsProps = Renderer.Component.KubeObjectDetailsProps<PipelineActivity>;

export class PipelineActivityDetails extends React.Component<PipelineActivityDetailsProps> {
  render() {
    return (
      <div className='PipelineActivity'>
        <DrawerTitle children='Jenkins X Pipeline' />
        <DrawerItem name='Context'>
          { this.props.object.spec.context }
        </DrawerItem>
        <DrawerItem name='Pipeline'>
          { this.props.object.spec.pipeline }
        </DrawerItem>
        <DrawerItem name='Build Number'>
          { this.props.object.spec.build }
        </DrawerItem>
        <DrawerItem name='Started'>
          { this.props.object.spec.startedTimestamp }
        </DrawerItem>
        <DrawerItem name='Completed'>
          { this.props.object.spec.completedTimestamp }
        </DrawerItem>
        <DrawerItem name='Status'>
          { this.props.object.spec.status }
        </DrawerItem>
        <DrawerItem name='Message'>
          { this.props.object.spec.message }
        </DrawerItem>

        <DrawerTitle children='Git' />
        <DrawerItem name='URL'>
          { this.props.object.spec.gitUrl }
        </DrawerItem>
        <DrawerItem name='Owner'>
          { this.props.object.spec.gitOwner }
        </DrawerItem>
        <DrawerItem name='Repository'>
          { this.props.object.spec.gitRepository }
        </DrawerItem>
        <DrawerItem name='Branch'>
          { this.props.object.spec.gitBranch }
        </DrawerItem>
        <DrawerItem name='LastCommitSHA'>
          { this.props.object.spec.lastCommitSHA }
        </DrawerItem>
        <DrawerItem name='BaseSHA'>
          { this.props.object.spec.baseSHA }
        </DrawerItem>

        <DrawerTitle children='Steps' />
        {
          this.props.object.spec.steps?.map(this.renderStep, this)
        }
      </div>
    )
  }

  private renderStep(step: PipelineActivityStep, index: number): React.JSX.Element {
    switch (step.kind.toLowerCase()) {
      case 'preview':
        return (
          <>
            <DrawerItem name={`${index + 1}: Preview`}>
              { step.preview?.name ?? 'Unknown' }
            </DrawerItem>
            { /* TODO: render preview details */ }
          </>
        );
      case 'promote':
        return (
          <>
            <DrawerItem name={`${index + 1}: Promote`}>
              { step.promote?.name ?? 'Unknown' }
            </DrawerItem>
            { /* TODO: render promote details */ }
          </>
        );
      case 'stage':
        return (
          <>
            <DrawerItem name={`${index + 1}: Stage`}>
              { step.stage?.name ?? 'Unknown' }
            </DrawerItem>
            <div style={{ paddingLeft: '2em' }}>
              <DrawerItem name='Started'>
                { step.stage?.startedTimestamp }
              </DrawerItem>
              <DrawerItem name='Completed'>
                { step.stage?.completedTimestamp }
              </DrawerItem>
              <DrawerItem name='Status'>
                { step.stage?.status }
              </DrawerItem>
              {
                step.stage?.steps?.map(this.renderStageStep, this)
              }
            </div>
          </>
        );
      default:
        return (
          <DrawerItem name={`Unknown type: ${step.kind}`} labelsOnly />
        );
    }
  }

  private renderStageStep(step: PipelineActivityStageStep, index: number): React.JSX.Element {
    return (
      <>
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
      </>
    );
  }
}
