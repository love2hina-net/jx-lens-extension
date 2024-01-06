import { Renderer } from "@k8slens/extensions";
import React from "react"

export function NoneIcon(props: Renderer.Component.IconProps): null | React.ReactElement<any, any> {
  return null;
}

export function BuildIcon(props: Renderer.Component.IconProps): null | React.ReactElement<any, any> {
  return <Renderer.Component.Icon {...props} material='build' tooltip='Build' />
}
