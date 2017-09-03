import { JsonPathType, JsonPathNode, jsonPathParser } from '../parser';

type RecursiveRecord<T> = {
  [index: number]: RecursiveRecord<T>;
  [key: string]: RecursiveRecord<T>;
}

type FlatDict = Record<string, string>;
type Dict = RecursiveRecord<string>;

type Setter = (obj: Dict, value: string) => void;

function setupByNodes(target: Dict, node: JsonPathNode, nextNode: JsonPathNode): Dict {
  switch (nextNode.type) {
    case JsonPathType.PROP:
      if (!target[node.value]) {
        target[node.value] = {};
      }
      break;
    case JsonPathType.INDEX:
      if (!target[node.value]) {
        target[node.value] = [] as any as Dict;
      }
      break;
    case JsonPathType.ASSIGN:
      target[node.value] = nextNode.value as any as Dict;
      break;
  }
  return target;
}

function getSetter(jsonPath: string): Setter {
  const result = jsonPathParser.parse(jsonPath);

  return function setter(obj: Dict, value: string): void {
    if (!result.status) {
      (<any> obj['[x]' + jsonPath]) = value;
      return; // fail
    }

    function getNextNode(nodes: JsonPathNode[], index: number): JsonPathNode {
      return nodes[index + 1] ? nodes[index + 1] : { type: JsonPathType.ASSIGN, value };
    }

    let target = obj;
    result.value.forEach((node: JsonPathNode, index: number, nodes: JsonPathNode[]) => {
      const nextNode = getNextNode(nodes, index);
      setupByNodes(target, node, nextNode);
      target = target[node.value] as Dict;
    });
  }
}

export function jsonPathConverter(obj: FlatDict): Dict {
  const ret = {};

  Object.keys(obj).forEach(jsonPath => {
    const value = obj[jsonPath];
    const setter = getSetter(jsonPath);
    setter(ret, value);
  });

  return ret;
}
