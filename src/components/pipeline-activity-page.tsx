import styles from '../../styles.module.scss';

import { Renderer } from '@k8slens/extensions';
import React from 'react';
import kebabCase from 'lodash/kebabCase';

import { pipelineActivitiesStore } from '../objects/pipeline-activity-store';
import { PipelineActivity } from '../objects/pipeline-activity';
import { lighthouseBreakpointsStore } from '../objects/lighthouse-breakpoint-store';
import { ExternalLink } from './external-link';

const {
  Component: { KubeObjectListLayout, TabLayout },
} = Renderer;

enum sortBy {
  owner = 'owner',
  repository = 'repository',
  branch = 'branch',
  status = 'status',
  age = 'age',
}

enum activityStatusType {
  // ActivityStatusTypePending an activity step is waiting to start
  Pending = 'Pending',
  // ActivityStatusTypeRunning an activity is running
  Running = 'Running',
  // ActivityStatusTypeSucceeded an activity completed successfully
  Succeeded = 'Succeeded',
  // ActivityStatusTypeFailed an activity failed
  Failed = 'Failed',
  // ActivityStatusTypeWaitingForApproval an activity is waiting for approval
  WaitingForApproval = 'WaitingForApproval',
  // ActivityStatusTypeError there is some error with an activity
  Error = 'Error',
  // ActivityStatusTypeAborted if the workflow was aborted
  Aborted = 'Aborted',
  // ActivityStatusTypeNotExecuted if the workflow was not executed
  NotExecuted = 'NotExecuted',
}

export class PipelineActivityPage extends React.Component {
  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          tableId='pipelineActivities'
          className={styles.PipelineActivityList}
          store={pipelineActivitiesStore}
          dependentStores={[lighthouseBreakpointsStore]}
          sortingCallbacks={{
            [sortBy.owner]: (activity: PipelineActivity) => activity.spec.gitOwner,
            [sortBy.repository]: (activity: PipelineActivity) => activity.spec.gitRepository,
            [sortBy.branch]: (activity: PipelineActivity) => activity.spec.gitBranch,
            [sortBy.status]: (activity: PipelineActivity) => activity.spec.status,
            [sortBy.age]: (activity: PipelineActivity) => activity.createdTime,
          }}
          searchFilters={[(activity: PipelineActivity) => activity.getSearchFields()]}
          renderHeaderTitle='Pipelines'
          renderTableHeader={[
            { title: 'Owner', className: 'owner', sortBy: sortBy.owner },
            { title: 'Repository', className: 'repository', sortBy: sortBy.repository },
            { title: 'Branch', className: 'branch', sortBy: sortBy.branch },
            { title: 'Build', className: 'build' },
            { title: 'Status', className: 'status', sortBy: sortBy.status },
            { title: 'Message', className: 'message' },
            { title: 'Age', className: 'age', sortBy: sortBy.age },
          ]}
          renderTableContents={(activity: PipelineActivity) => {
            return [
              activity.spec.gitOwner,
              activity.spec.gitRepository,
              activity.spec.gitBranch,
              activity.buildName,
              PipelineActivityPage.renderStatus(activity),
              PipelineActivityPage.renderLastStep(activity),
              activity.createdAt,
            ];
          }}
        />
      </TabLayout>
    );
  }

  // renderLastStep returns the last step
  private static renderStatus(pa: PipelineActivity): React.JSX.Element | '' {
    const status = pa.spec.status;
    if (status) {
      const statusClass = 'status-' + kebabCase(status);
      return <span className={styles[statusClass]}>{status}</span>;
    }
    else {
      return '';
    }
  }

  // renderLastStep returns the last step
  private static renderLastStep(pa: PipelineActivity): React.JSX.Element | string {
    const step = pa.spec.steps?.at(-1);
    if (!step) {
      return '';
    }

    {
      const stage = step.stage;
      if (stage) {
        return stage.steps?.findLast((v, i) => (v.status != activityStatusType.Pending || i == 0))?.name ?? stage.name;
      }
    }
    {
      const promote = step.promote;
      if (promote) {
        const pr = promote.pullRequest;
        const prURL = pr?.pullRequestURL;
        let title = pr?.name;

        if (prURL) {
          let prName = 'PR';
          const i = prURL.lastIndexOf('/');
          if (i > 0 && i < prURL.length) {
            prName = prURL.substring(i + 1);
          }
          const env = promote.environment;
          if (env) {
            // TODO to title for env
            title = 'Promote to ' + env;
          }
          return (
            <span>
              {title}
              &nbsp;
              <ExternalLink
                href={prURL}
                text={'#' + prName}
                title='view the prompte Pull Request'
              />
            </span>
          );
        }
        return promote.name;
      }
    }
    {
      const preview = step.preview;
      if (preview) {
        const appURL = preview.applicationURL;
        if (appURL) {
          const title = preview.name ?? 'Preview';
          return (
            <span>
              Promote&nbsp;
              <ExternalLink
                href={appURL}
                text={title}
                title='view the preview application'
              />
            </span>
          );
        }
        return preview.name;
      }
    }

    return '';
  }
}
