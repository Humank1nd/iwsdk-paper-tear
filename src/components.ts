import { createComponent, Types, defineComponents } from '@iwsdk/core';

export const TearablePaper = createComponent('TearablePaper', {
  tearThreshold: { type: Types.Float32, default: 0.45 },
  isTorn: { type: Types.Boolean, default: false },
});

export const TearHandle = createComponent('TearHandle', {
  side: { type: Types.Int8, default: 0 }, // 0 = left, 1 = right
});

export default defineComponents([TearablePaper, TearHandle]);
