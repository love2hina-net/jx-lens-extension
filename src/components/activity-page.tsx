import styles from "../../styles.module.scss";

import {Renderer} from "@k8slens/extensions";
import React from "react";
import {activitiesStore} from "../activity-store";
import {Activity} from "../activity"
import kebabCase from "lodash/kebabCase";

enum sortBy {
  owner = "owner",
  repository = "repository",
  branch = "branch",
  status = "status"
}

// ActivityStatusTypePending an activity step is waiting to start
const ActivityStatusTypePending = "Pending"
// ActivityStatusTypeRunning an activity is running
const ActivityStatusTypeRunning = "Running"
// ActivityStatusTypeSucceeded an activity completed successfully
const ActivityStatusTypeSucceeded = "Succeeded"
// ActivityStatusTypeFailed an activity failed
const ActivityStatusTypeFailed = "Failed"
// ActivityStatusTypeWaitingForApproval an activity is waiting for approval
const ActivityStatusTypeWaitingForApproval = "WaitingForApproval"
// ActivityStatusTypeError there is some error with an activity
const ActivityStatusTypeError = "Error"
// ActivityStatusTypeAborted if the workflow was aborted
const ActivityStatusTypeAborted = "Aborted"
// ActivityStatusTypeNotExecuted if the workflow was not executed
const ActivityStatusTypeNotExecuted = "NotExecuted"

export class ActivityPage extends React.Component<{ extension: Renderer.LensExtension }> {

  render() {
    return (
      <Renderer.Component.TabLayout>
        <Renderer.Component.KubeObjectListLayout
          className={styles.PipelineActivityList} store={activitiesStore}
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
          renderTableContents={(activity: Activity) => {
            return [
              activity.spec.gitOwner,
              activity.spec.gitRepository,
              activity.spec.gitBranch,
              activity.buildName,
              RenderStatus(activity),
              RenderLastStep(activity)
            ];
          }}
        />
      </Renderer.Component.TabLayout>
    )
  }
}

// RenderLastStep returns the last step
function RenderStatus(pa: Activity) {
  if (!pa || !pa.spec) {
    return "";
  }
  let status = pa.spec.status;
  let statusClass = "status-" + kebabCase(status);
  return (
    <span className={styles[statusClass]}>{status}</span>
  );
}

// RenderLastStep returns the last step
function RenderLastStep(pa: Activity) {
  if (!pa || !pa.spec) {
    return "";
  }
  let steps = pa.spec.steps;
  if (!steps || !steps.length) {
    return "";
  }
  let step = steps[steps.length - 1];
  if (!step) {
    return "";
  }

  let st = step.stage;
  if (st) {
    let ssteps = st.steps;
    if (ssteps && ssteps.length) {
      for (let i = ssteps.length - 1; i >= 0; i--) {
        let ss = ssteps[i];
        if (ss.status == ActivityStatusTypePending && i > 0) {
          continue;
        }
        return ss.name;
      }
    }
    return st.name
  }

  let promote = step.promote;
  if (promote) {
    let prURL = "";
    let title = ""
    let pr = promote.pullRequest;
    if (pr) {
      prURL = pr.pullRequestURL;
      title = pr.name;
    }
    if (prURL) {
      let prName = "PR"
      let i = prURL.lastIndexOf("/");
      if (i > 0 && i < prURL.length) {
        prName = prURL.substr(i + 1);
      }
      let env = promote.environment;
      if (env) {
        // TODO to title for env
        title = "Promote to " + env;
      }
      return (
        <span>{title} <a href={prURL}>#{prName}</a></span>
      );
    }
    return promote.name;
  }

  let preview = step.preview;
  if (preview) {
    let appURL = preview.applicationURL;
    if (appURL) {
      let title = preview.name;
      if (!title) {
        title = "Preview"
      }
      return (
        <span>Promote <a href={appURL}>{title}</a></span>
      );
    }
    return preview.name;
  }
  return st.name;
}