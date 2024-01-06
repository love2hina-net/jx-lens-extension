import { Renderer } from '@k8slens/extensions';
import React from 'react';

import { pipelineActivitiesStore } from '../objects/pipeline-activity-store';
import { PipelineActivity } from '../objects/pipeline-activity';

const {
  Component: {
    KubeObjectListLayout,
    TabLayout,
  }
} = Renderer;

enum sortBy {
  name = 'name',
  namespace = 'namespace',
  repository = 'repository',
  status = 'status',
  started = 'started'
}

export class PipelineActivityPage extends React.Component {
  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          className='PipelineActivities'
          tableId='jenkins.io/v1/PipelineActivities'
          store={pipelineActivitiesStore}
          sortingCallbacks={{
            [sortBy.name]: (pa: PipelineActivity) => pa.getName(),
            [sortBy.namespace]: (pa: PipelineActivity) => pa.getNs(),
            [sortBy.repository]: (pa: PipelineActivity) => pa.spec.gitRepository,
            [sortBy.status]: (pa: PipelineActivity) => pa.spec.status,
            [sortBy.started]: (pa: PipelineActivity) => pa.spec.startedTimestamp
          }}
          searchFilters={[
            (pa: PipelineActivity) => pa.getSearchFields()
          ]}
          renderHeaderTitle='PipelineActivities'
          renderTableHeader={[
            { title: 'Name', className: 'name', sortBy: sortBy.name },
            { title: 'Namespace', className: 'namespace', sortBy: sortBy.namespace },
            { title: 'Repository', className: 'repository', sortBy: sortBy.repository },
            { title: 'Status', className: 'status', sortBy: sortBy.status },
            { title: 'Started Time', className: 'started', sortBy: sortBy.started }
          ]}
          renderTableContents={(pa: PipelineActivity) => [
            pa.getName(),
            pa.getNs(),
            pa.spec.gitRepository,
            pa.spec.status,
            pa.spec.startedTimestamp
          ]}
        />
      </TabLayout>
    )
  }
}
