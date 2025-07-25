import type { TreeNode } from '../core/tree'
import { generateRouteParams } from './generateRouteParams'

export function generateRouteNamedMap(node: TreeNode): string {
  if (node.isRoot()) {
    return `export interface RouteNamedMap {
${node.getSortedChildren().map(generateRouteNamedMap).join('')}}`
  }

  return (
    // if the node has a filePath, it's a component, it has a routeName and it should be referenced in the RouteNamedMap
    // otherwise it should be skipped to avoid navigating to a route that doesn't render anything
    (node.value.components.size > 0
      ? `  '${node.name}': ${generateRouteRecordInfo(node)},\n`
      : '') +
    (node.children.size > 0
      ? node.getSortedChildren().map(generateRouteNamedMap).join('\n')
      : '')
  )
}

export function generateRouteRecordInfo(node: TreeNode) {
  const typeParams = [
    `'${node.name}'`,
    `'${node.fullPath}'`,
    generateRouteParams(node, true),
    generateRouteParams(node, false),
  ]

  if (node.children.size > 0) {
    const deepNamedChildren = node
      .getSortedChildrenDeep()
      // skip routes that are not added to the types
      .filter(
        (childRoute) => childRoute.value.components.size > 0 && childRoute.name
      )
      .map((childRoute) => `'${childRoute.name}'`)

    if (deepNamedChildren.length > 0) {
      typeParams.push(deepNamedChildren.join(' | '))
    }
  }

  return `RouteRecordInfo<${typeParams.join(', ')}>`
}
