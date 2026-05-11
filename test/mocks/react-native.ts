// Test mock for `react-native`. Only the bits the modules under test actually
// pull in — Platform (for shop/firebase branches) and a placeholder for
// anything else that may be referenced via dynamic destructuring.
export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web',
  select: <T>(spec: { ios?: T; android?: T; web?: T; default?: T }): T | undefined =>
    spec.ios ?? spec.default,
};
