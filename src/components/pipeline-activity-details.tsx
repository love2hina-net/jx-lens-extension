import { Renderer } from '@k8slens/extensions';
import React from 'react';
import { TreeView, TreeItem } from '@mui/x-tree-view';

import { PipelineActivity, PipelineActivityStep, PipelineActivityCoreStep } from '../objects/pipeline-activity';
import { createdTime } from '../common';

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  },
} = Renderer;

function CollapseIcon() {
  return (
    <Renderer.Component.Icon material='expand_more' tooltip='Expand' />
  );
}

function ExpandIcon() {
  return (
    <Renderer.Component.Icon material='chevron_right' tooltip='Expand' />
  );
}

export type PipelineActivityDetailsProps = Renderer.Component.KubeObjectDetailsProps<PipelineActivity>;

export class PipelineActivityDetails extends React.Component<PipelineActivityDetailsProps> {
  render() {
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
          { createdTime(activity.spec.startedTimestamp) }
        </DrawerItem>
        <DrawerItem name='Completed'>
          { createdTime(activity.spec.completedTimestamp) }
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
        <TreeView
          aria-label='Jenkins X Pipeline Steps'
          defaultExpandIcon={<ExpandIcon />}
          defaultCollapseIcon={<CollapseIcon />}
        >
          { activity.spec.steps?.map(this.renderStepNodes, this) }
        </TreeView>
      </div>
    );
  }

  private renderStepNodes(step: PipelineActivityStep, index: number): React.JSX.Element {
    switch (step.kind.toLowerCase()) {
      case 'preview':
        return this.renderStepCoreNodes(step.preview, 'step', index);
        /* TODO: render preview details */
      case 'promote':
        return this.renderStepCoreNodes(step.promote, 'step', index);
        /* TODO: render promote details */
      case 'stage':
        return this.renderStepCoreNodes(step.stage, 'step', index, (baseId) => {
          return (<>{ step.stage?.steps?.map((step, i) => this.renderStepCoreNodes(step, baseId, i), this) }</>);
        });
      default:
        return (
          <TreeItem nodeId={`step-${index}`} label={`Unknown type: ${step.kind}`} />
        );
    }
  }

  private renderStepCoreNodes(
    step: PipelineActivityCoreStep | undefined,
    baseId: string,
    index: number,
    optional?: (baseId: string) => React.JSX.Element): React.JSX.Element {
    const id = `${baseId}-${index}`;
    return (
      <TreeItem nodeId={id} label={<DrawerItem name={`${index + 1}:`}>{ step?.name ?? 'Unknown' }</DrawerItem>}>
        { step && (
          <>
            <TreeItem nodeId={`${id}-desc`} label={<DrawerItem name='Description'>{ step.description }</DrawerItem>} />
            <TreeItem nodeId={`${id}-status`} label={<DrawerItem name='Status'>{ step.status }</DrawerItem>} />
            <TreeItem nodeId={`${id}-start`} label={<DrawerItem name='Started'>{ createdTime(step.startedTimestamp) }</DrawerItem>} />
            <TreeItem nodeId={`${id}-complete`} label={<DrawerItem name='Completed'>{ createdTime(step.completedTimestamp) }</DrawerItem>} />
            { optional && optional(id) }
          </>
        ) }
      </TreeItem>
    );
  }
}
