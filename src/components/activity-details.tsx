import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { PipelineActivity } from '../objects/pipeline-activity';
import { podFromActivity, toContainerName } from './pipeline-activity-menu';

export type ActivityDetailsProps = Renderer.Component.KubeObjectDetailsProps<PipelineActivity>;

export class ActivityDetails extends React.Component<ActivityDetailsProps> {
  render() {
    const { object: activity } = this.props;
    if (!activity) return null;

    const containers = activity.activityContainers;
    const pod = podFromActivity(activity);

    return (
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


      <div className='Activity'>
        <Renderer.Component.DrawerItem name='Pipeline'>
          { activity.pipelineDescription }
        </Renderer.Component.DrawerItem>

        {
          pod && containers.length > 1 && containers.map(step => {
            const name = toContainerName(step.name);
            const container = pod.spec.containers?.find((c) => c.name == name);

            return (
              <Renderer.Component.DrawerItem key={step.name} name={step.name}>
                { container && container.image }
              </Renderer.Component.DrawerItem>
            );
          })
        }
      </div>
    )
  }
}
