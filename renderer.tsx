import {Renderer} from "@k8slens/extensions";
import React from "react";
import {ActivityDetails, ActivityDetailsProps} from "./src/components/activity-details";
import {ActivityPage} from "./src/components/activity-page";
import {Activity} from "./src/activity"
import {ActivityMenu, ActivityMenuProps} from "./src/components/activity-menu";
import {PreviewPage} from "./src/components/preview-page";
import {PreviewMenu, PreviewMenuProps} from "./src/components/preview-menu";
import {Preview} from "./src/preview";

export function JXIcon(props: Renderer.Component.IconProps) {
  const JXLogo = require(`!!raw-loader!./jx.svg`).default;

  return <Renderer.Component.Icon {...props} svg={JXLogo} tooltip="Jenkins X"/>
}

export default class JenkinsXExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "pipelines",
      components: {
        Page: () => <ActivityPage extension={this}/>,
        MenuIcon: JXIcon,
      }
    }, {
      id: "previews",
      components: {
        Page: () => <PreviewPage extension={this}/>,
        MenuIcon: JXIcon,
      }
    }
  ]

  clusterPageMenus = [
    {
      id: "jenkins-x",
      title: "Jenkins X",
      components: {
        Icon: JXIcon,
      }
    },
    {
      id: "jenkins-x/pipelines",
      parentId: "jenkins-x",
      target: {pageId: "pipelines"},
      title: "Pipelines",
      components: {
        Icon: JXIcon,
      }
    },
    {
      id: "jenkins-x/previews",
      parentId: "jenkins-x",
      target: {pageId: "previews"},
      title: "Previews",
      components: {
        Icon: JXIcon,
      }
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Activity.kind,
      apiVersions: ["jenkins.io/v1"],
      components: {
        MenuItem: (props: ActivityMenuProps) => <ActivityMenu {...props} />
      }
    },
    {
      kind: Preview.kind,
      apiVersions: ["preview.jenkins.io/v1alpha1"],
      components: {
        MenuItem: (props: PreviewMenuProps) => <PreviewMenu {...props} />
      }
    },
  ];


  kubeObjectDetailItems = [{
    kind: Activity.kind,
    apiVersions: ["jenkins.io/v1"],
    components: {
      Details: (props: ActivityDetailsProps) => <ActivityDetails {...props} />
    }
  }]
}
