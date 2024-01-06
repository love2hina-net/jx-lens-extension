import { Renderer } from '@k8slens/extensions';
import React from 'react';
import { Link } from 'react-router-dom';

const {
  Component: {
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
  ];

  constructor(props: JxRelationsDetailsProps) {
    super(props);
    this.state = {
      relations: []
    };
  }

  async componentDidMount() {
    const namespace = this.props.object.getNs();
    const jxId = this.props.object.getLabels().find((label) => label.startsWith('lighthouse.jenkins-x.io/id='));

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
      }))).flat().filter((obj) => obj.getId() != this.props.object.getId());

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
                { obj.getName() }
              </Link>
            </DrawerItem>
          ))
        }
      </div>
    );
  }
}
