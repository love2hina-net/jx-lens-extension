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
    /*
      <div>
        <nav>
          <Renderer.Component..
          <RecursiveTreeView data={dataTree}/>
        </nav>
        <section id='application'>
          <h1>Application</h1>
        </section>
      </div>
     */

    // TODO a tree would be great! :)

    /*
      // TODO: BUG: 1つのアクティビティで複数のPodがあるので、正しくない
      <div className='Activity'>
        {
          pod && containers.length > 1 && containers.map(step => {
            const name = PipelineActivity.toContainerName(step);
            const container = pod.spec.containers?.find((c) => c.name == name);

            return (
              <Renderer.Component.DrawerItem key={step.name} name={step.name}>
                { container && container.image }
              </Renderer.Component.DrawerItem>
            );
          })
        }
      </div>
     */

    const { object: activity } = this.props;
    return (
      <div className='PipelineActivity'>
        <DrawerTitle children='Jenkins X Pipeline' />
        <DrawerItem name='Pipeline'>
          { activity.pipelineDescription }
        </DrawerItem>
        <DrawerItem name='Started'>
          { activity.spec.startedTimestamp }
        </DrawerItem>
        <DrawerItem name='Completed'>
          { activity.spec.completedTimestamp }
        </DrawerItem>
        <DrawerItem name='Status'>
          { activity.spec.status }
        </DrawerItem>
        <DrawerItem name='Message'>
          { activity.spec.message }
        </DrawerItem>

        <DrawerTitle children='Git' />
        <DrawerItem name='URL'>
          { activity.spec.gitUrl }
        </DrawerItem>
        <DrawerItem name='Owner'>
          { activity.spec.gitOwner }
        </DrawerItem>
        <DrawerItem name='Repository'>
          { activity.spec.gitRepository }
        </DrawerItem>
        <DrawerItem name='Branch'>
          { activity.spec.gitBranch }
        </DrawerItem>
        <DrawerItem name='LastCommitSHA'>
          { activity.spec.lastCommitSHA }
        </DrawerItem>
        <DrawerItem name='BaseSHA'>
          { activity.spec.baseSHA }
        </DrawerItem>

        <DrawerTitle children='Steps' />
        {
          activity.spec.steps?.map(this.renderStep, this)
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
