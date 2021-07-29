import {Renderer} from "@k8slens/extensions";
import React from "react";
import {activitiesStore} from "../activity-store";
import {Activity} from "../activity"

enum sortBy {
  owner = "owner",
  repository = "repository",
  branch = "branch",
  status = "status"
}

export class ActivityPage extends React.Component<{ extension: Renderer.LensExtension }> {

  render() {
    return (
      <Renderer.Component.TabLayout>
        <Renderer.Component.KubeObjectListLayout
          className="Certicates" store={activitiesStore}
          sortingCallbacks={{
            [sortBy.owner]: (activity: Activity) => activity.spec.gitOwner,
            [sortBy.repository]: (activity: Activity) => activity.spec.gitRepository,
            [sortBy.branch]: (activity: Activity) => activity.spec.gitBranch,
            [sortBy.status]: (activity: Activity) => activity.spec.status,
          }}
          searchFilters={[
            (activity: Activity) => activity.getSearchFields()
          ]}
          renderHeaderTitle="Activities"
          renderTableHeader={[
            {title: "Owner", className: "owner", sortBy: sortBy.owner},
            {title: "Repository", className: "repository", sortBy: sortBy.repository},
            {title: "Branch", className: "branch", sortBy: sortBy.branch},
            {title: "Build", className: "build"},
            {title: "Status", className: "status", sortBy: sortBy.status},
            {title: "Message", className: "message"},
          ]}
          renderTableContents={(activity: Activity) => [
            activity.spec.gitOwner,
            activity.spec.gitRepository,
            activity.spec.gitBranch,
            activity.buildName,
            activity.spec.status,
            activity.lastStepStatus,
          ]}
        />
      </Renderer.Component.TabLayout>
    )
  }
}