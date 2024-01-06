import { Renderer } from '@k8slens/extensions';
import React from 'react';
import { Link } from 'react-router-dom';

const {
  Component: {
    Button,
    DrawerItem,
    DrawerTitle,
  }
} = Renderer;

export type JxRelationsDetailsProps = Renderer.Component.KubeObjectDetailsProps;

type KubeObject = Renderer.K8sApi.KubeObject;

type JxRelationsDetailsState = {
  relations: KubeObject[];
};

export class JxRelationsDetails extends React.Component<JxRelationsDetailsProps, JxRelationsDetailsState> {
  public static readonly JX_K8S_KIND = [
    { apiVersions: ['jenkins.io/v1'], kind: 'PipelineActivity' },
    { apiVersions: ['lighthouse.jenkins.io/v1alpha1'], kind: 'LighthouseJob' },
    { apiVersions: ['tekton.dev/v1beta1'], kind: 'PipelineRun' },
    { apiVersions: ['tekton.dev/v1beta1'], kind: 'TaskRun' },
    { apiVersions: ['batch/v1'], kind: 'Job' },
    { apiVersions: ['v1'], kind: 'Pod' },
  ];

  constructor(props: JxRelationsDetailsProps) {
    super(props);
    this.state = {
      relations: []
    };
  }

  async componentDidMount() {
    const { object } = this.props;
    const namespace = object.getNs();
    const jxId = object.getLabels().find((label) => label.startsWith('lighthouse.jenkins-x.io/id='));

    if (namespace && jxId) {
      const newState: JxRelationsDetailsState = {
        relations: []
      };

      newState.relations = (await Promise.all(JxRelationsDetails.JX_K8S_KIND.flatMap((i) => {
        return i.apiVersions.map(async (apiVersion) => {
          const api = Renderer.K8sApi.apiManager.getApiByKind(i.kind, apiVersion);
          const store = (api != undefined)? Renderer.K8sApi.apiManager.getStore(api) : undefined;

          if (store) {
            await store.loadAll({ namespaces: [namespace] });
            return store.getByLabel([jxId]);
          }
          else {
            return [];
          }
        });
      }))).flat().filter((obj) => obj.getId() != object.getId());

      this.setState(newState);
    }
  }

  render() {
    return (
      <div className='JxRelations'>
        <DrawerTitle children='Jenkins X Relations' />
        {
          this.state.relations.map((obj) => (
            <DrawerItem
              key={obj.getId()}
              name={obj.kind}>
              <Link to={Renderer.Navigation.getDetailsUrl(obj.selfLink)}>
                { obj.getName() }&nbsp;
                <this.LogButton object={obj} />
              </Link>
            </DrawerItem>
          ))
        }
      </div>
    );
  }

  private LogButton({ object }: { object: KubeObject }): React.JSX.Element | null {
    if (object instanceof Renderer.K8sApi.Pod) {
      // Pod
      return (
        <Button onClick={() => JxRelationsDetails.showPodLog(object)}>Log</Button>
      );
    }
    else if (object instanceof Renderer.K8sApi.Job) {
      // Job
      return (
        <Button onClick={() => JxRelationsDetails.showJobLog(object)}>Log</Button>
      );
    }

    return null;
  }

  private static showPodLog(pod: Renderer.K8sApi.Pod) {
    const firstContainer = pod.getContainers()[0];

    if (firstContainer) {
      Renderer.Navigation.hideDetails();
      Renderer.Component.logTabStore.createPodTab({
        selectedPod: pod,
        selectedContainer: firstContainer,
      });
    }
    else {
      Renderer.Component.notificationsStore.add({
        status: Renderer.Component.NotificationStatus.ERROR,
        message: `Could not find container in pod ${pod.getName()}`,
      });
    }
  }

  private static showJobLog(job: Renderer.K8sApi.Job): void {
    Renderer.Navigation.hideDetails();
    Renderer.Component.logTabStore.createWorkloadTab({
      workload: job,
    });
  }
}
