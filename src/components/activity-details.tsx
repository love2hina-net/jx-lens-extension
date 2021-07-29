import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Activity } from "../activity";

export interface ActivityDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Activity>{
}

export class ActivityDetails extends React.Component<ActivityDetailsProps> {

  render() {
    const { object: activity } = this.props;
    if (!activity) return null;
    return (
      <div className="Activity">
        <Renderer.Component.DrawerItem name="Created">
          {activity.getAge(true, false)} ago ({activity.metadata.creationTimestamp })
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Name">
          {activity.getName()}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Secret">
         secret
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Status" className="status" labelsOnly>
          blah
        </Renderer.Component.DrawerItem>
      </div>
    )
  }
}
