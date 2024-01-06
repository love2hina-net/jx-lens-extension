import styles from "../../styles.module.scss";

import {Renderer} from "@k8slens/extensions";
import React from "react";
import {pipelineActivitiesStore} from "../objects/pipeline-activity-store";
import {PipelineActivity} from "../objects/pipeline-activity"
import kebabCase from "lodash/kebabCase";
import {ExternalLink} from "./external-link";
import {breakpointsStore} from "../objects/breakpoint-store";

const {
  Component: {
    KubeObjectListLayout,
    TabLayout,
  },
} = Renderer;

enum sortBy {
  owner = "owner",
  repository = "repository",
  branch = "branch",
  status = "status",
  age = "age"
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

export class ActivityPage extends React.Component {

  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          tableId="pipelineActivities"
          className={styles.PipelineActivityList} store={pipelineActivitiesStore}
          sortingCallbacks={{
            [sortBy.owner]: (activity: PipelineActivity) => activity.spec.gitOwner,
            [sortBy.repository]: (activity: PipelineActivity) => activity.spec.gitRepository,
            [sortBy.branch]: (activity: PipelineActivity) => activity.spec.gitBranch,
            [sortBy.status]: (activity: PipelineActivity) => activity.spec.status,
            [sortBy.age]: (activity: PipelineActivity) => activity.createdTime,
          }}
          dependentStores={[breakpointsStore]}
          searchFilters={[
            (activity: PipelineActivity) => activity.getSearchFields()
          ]}
          renderHeaderTitle="Pipelines"
          renderTableHeader={[
            {title: "Owner", className: "owner", sortBy: sortBy.owner},
            {title: "Repository", className: "repository", sortBy: sortBy.repository},
            {title: "Branch", className: "branch", sortBy: sortBy.branch},
            {title: "Build", className: "build"},
            {title: "Status", className: "status", sortBy: sortBy.status},
            {title: "Message", className: "message"},
            {title: "Age", className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(activity: PipelineActivity) => {
            return [
              activity.spec.gitOwner,
              activity.spec.gitRepository,
              activity.spec.gitBranch,
              activity.buildName,
              renderStatus(activity),
              renderLastStep(activity),
              activity.createdAt
            ];
          }}
        />
      </TabLayout>
    )
  }
}

// renderLastStep returns the last step
function renderStatus(pa: PipelineActivity) {
  if (!pa || !pa.spec) {
    return "";
  }
  let status = pa.spec.status;
  let statusClass = "status-" + kebabCase(status);
  return (
    <span className={styles[statusClass]}>{status}</span>
  );
}

// renderLastStep returns the last step
function renderLastStep(pa: PipelineActivity) {
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
    let prURL: string | undefined = "";
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
        <span>{title} <ExternalLink href={prURL} text={"#" + prName}
                                    title="view the prompte Pull Request"></ExternalLink></span>
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
        <span>Promote <ExternalLink href={appURL} text={title}
                                    title="view the preview application"></ExternalLink></span>
      );
    }
    return preview.name;
  }
  return '';
}

