import * as P from 'parsimmon';

// json-path -> propName ( prop / index )*
// prop      -> '.' propName
// index     -> '[' number ']'
// propName  -> [a-zA-Z0-9] +
// number    -> '0' | [1-9] [0-9]*
//
// propName should follow https://tools.ietf.org/html/rfc7159#section-7 but we didn't to keep simplicity.

// types

export enum JsonPathType {
  PROP = 'prop',
  INDEX = 'index',
  ASSIGN = 'assign',
}

interface JsonPathPropNode {
  type: JsonPathType.PROP;
  value: string;
}

interface JsonPathIndexNode {
  type: JsonPathType.INDEX;
  value: number;
}

interface JsonPathAssignNode {
  type: JsonPathType.ASSIGN;
  value: string;
}

export type JsonPathNode = JsonPathPropNode | JsonPathIndexNode | JsonPathAssignNode;

// parsers

const number = P.regexp(/0|[1-9][0-9]*/).map(Number);

const propName = P
  .regexp(/[a-zA-Z0-9]+/)
  .map(name => ({
    type: JsonPathType.PROP,
    value: name,
  } as JsonPathPropNode));

const prop = P.seqMap(
  P.string('.'),
  propName,
  (_1, parsedPropName) => ({
    type: JsonPathType.PROP,
    value: parsedPropName.value,
  } as JsonPathPropNode),
);

const index = P.seqMap(
  P.string('['),
  number,
  P.string(']'),
  (_1, n, _3) => ({
    type: JsonPathType.INDEX,
    value: n,
  } as JsonPathIndexNode),
);

export const jsonPathParser: P.Parser<JsonPathNode[]> = P.seqMap(
  propName,
  prop.or(index).many(),
  (h ,t) => [h as JsonPathNode].concat(t),
);
