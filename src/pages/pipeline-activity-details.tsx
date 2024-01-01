import { Renderer } from '@k8slens/extensions';
import React from 'react';
import pickBy from 'lodash.pickby';

import { PipelineActivity, PipelineActivityStep, PipelineActivityStageStep } from '../objects/pipeline-activity';
import { PipelineRun } from '../objects/pipeline-run';
import { pipelineRunsStore } from '../objects/pipeline-run-store';

const {
  Component: {
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export interface PipelineActivityDetailsProps extends Renderer.Component.KubeObjectDetailsProps<PipelineActivity> {
}

type PipelineActivityState = {
  runs: PipelineRun[];
}

export class PipelineActivityDetails extends React.Component<PipelineActivityDetailsProps, PipelineActivityState> {

  readonly pipelineActivity: PipelineActivity;

  constructor(props: PipelineActivityDetailsProps) {
    super(props);
    this.pipelineActivity = props.object;
    this.state = {
      runs: []
    };
  }

  async componentDidMount() {
    await pipelineRunsStore.loadAll();
    // pipelineActivity.metadata.labelsからキーが'lighthouse.jenkins-x.io'のものを抽出
    const labels = pickBy(this.pipelineActivity.metadata.labels, (value, key) => key.startsWith('lighthouse.jenkins-x.io/'));
    this.setState({ runs: pipelineRunsStore.getByLabel(labels) });
  }

  render() {
    return (
      <div className='PipelineActivity'>
        <DrawerTitle children='Jenkins X Pipeline' />
        <DrawerItem name='Context'>
          { this.pipelineActivity.spec.context }
        </DrawerItem>
        <DrawerItem name='Pipeline'>
          { this.pipelineActivity.spec.pipeline }
        </DrawerItem>
        <DrawerItem name='Build Number'>
          { this.pipelineActivity.spec.build }
        </DrawerItem>
        <DrawerItem name='Started'>
          { this.pipelineActivity.spec.startedTimestamp }
        </DrawerItem>
        <DrawerItem name='Completed'>
          { this.pipelineActivity.spec.completedTimestamp }
        </DrawerItem>
        <DrawerItem name='Status'>
          { this.pipelineActivity.spec.status }
        </DrawerItem>
        <DrawerItem name='Message'>
          { this.pipelineActivity.spec.message }
        </DrawerItem>

        <DrawerTitle children='Git' />
        <DrawerItem name='URL'>
          { this.pipelineActivity.spec.gitUrl }
        </DrawerItem>
        <DrawerItem name='Owner'>
          { this.pipelineActivity.spec.gitOwner }
        </DrawerItem>
        <DrawerItem name='Repository'>
          { this.pipelineActivity.spec.gitRepository }
        </DrawerItem>
        <DrawerItem name='Branch'>
          { this.pipelineActivity.spec.gitBranch }
        </DrawerItem>
        <DrawerItem name='LastCommitSHA'>
          { this.pipelineActivity.spec.lastCommitSHA }
        </DrawerItem>
        <DrawerItem name='BaseSHA'>
          { this.pipelineActivity.spec.baseSHA }
        </DrawerItem>

        <DrawerTitle children='Steps' />
        {
          this.pipelineActivity.spec.steps.map(this.renderStep, this)
        }

        <DrawerTitle children='Tekton Pipeline' />
        { this.renderTest() }
      </div>
    )
  }

  private renderStep(step: PipelineActivityStep, index: number): React.JSX.Element {
    switch (step.kind.toLowerCase()) {
      case 'preview':
        return (
          <>
            <DrawerItem name={`${index + 1}: Preview`}>
              { step.preview.name }
            </DrawerItem>
            { /* TODO: render preview details */ }
          </>
        );
      case 'promote':
        return (
          <>
            <DrawerItem name={`${index + 1}: Promote`}>
              { step.promote.name }
            </DrawerItem>
            { /* TODO: render promote details */ }
          </>
        );
      case 'stage':
        return (
          <>
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

  private renderTest(): React.JSX.Element {
    return (
      <>
        { this.state.runs.map((run) => (
          <React.Fragment key={run.metadata.uid}>
            <DrawerItem name='Name'>
              { run.metadata.name }
            </DrawerItem>
            <DrawerItem name='Namespace'>
              { run.metadata.namespace }
            </DrawerItem>
          </React.Fragment>
        )) }
      </>
    );
  }
}
