import 'mocha';
import * as assert from 'power-assert';

import { jsonPathConverter } from '../../main/converter/json-path-converter';

function assertConvert(args :{ from: Record<string, string>, to: any }): void {
  const converted = jsonPathConverter(args.from);
  const expected = args.to;

  assert.deepStrictEqual(converted, expected);
}

describe('jsonPathConverter', ()=> {

  it('ネストしていないオブジェクトは変換してもそのまま', () => {
    const from = {
      'prop1': 'value1',
      'otherProp': 'value2',
    };

    assertConvert({ from, to: from });
  });

  it('ネストしたオブジェクトを変換した時に適切に変換できる', () => {
    const from = {
      'prop1.prop2.prop3': 'value',
    };

    const to = { prop1: { prop2: { prop3: 'value' } } };

    assertConvert({ from, to });
  });

  it('配列がフラットにされている時、インデックスが飛び飛びでも適切に変換できる', () => {
    const from = {
      'prop[0]': 'arr0',
      'prop[2]': 'arr2',
      'prop[4]': 'arr4',
    };

    const to = {
      prop: ['arr0', /* empty */, 'arr2', /* empty */, 'arr4'],
    };

    assertConvert({ from, to });
  });

  it('オブジェクトのネストと配列両方存在しても適切に変換できる', () => {
    const from = {
      'object.nested': 'object',
      'array[0]': 'array',
    };

    const to = {
      object: { nested: 'object' },
      array: [ 'array' ],
    };

    assertConvert({ from, to });
  });

  it('ネスとしたオブジェクトに配列が存在しても適切に変換できる', () => {
    const from = {
      'out.in[0]': 'arr',
    };

    const to = {
      out: { in: [ 'arr' ] },
    };

    assertConvert({ from, to });
  });

  it('配列中にオブジェクトが存在しても適切に変換できる', () => {
    const from = {
      'wrapper[0].prop': 'value',
    };

    const to = {
      wrapper: [ { prop: 'value' }],
    };

    assertConvert({ from, to });
  });

  it('複雑なオブジェクトパスが存在しても適切に変換できる', () => {
    const from = {
      'a.b.c.d1': 'nested1',
      'a.b.c.d2': 'nested2',
      'w[0].p1': '0p1',
      'w[0].p2': '0p2',
      'w[1].p3': '1p3',
      'w[10].p2': '10p2',
    };

    const to = {
      a: { b: { c: { d1: 'nested1', d2: 'nested2' } } },
      w: [
        { p1: '0p1', p2: '0p2' },
        { p3: '1p3' },
      ],
    };
    (<any> to.w[10]) = { p2: '10p2' };

    assertConvert({ from, to });
  });

});
