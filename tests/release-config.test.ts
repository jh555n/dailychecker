import test from 'node:test';
import assert from 'node:assert/strict';
import configure from '../app.config';

const keys = [
  'EAS_BUILD_PROFILE',
  'IOS_BUNDLE_IDENTIFIER',
  'EAS_PROJECT_ID',
  'EXPO_OWNER',
  'EXPO_PUBLIC_PRIVACY_POLICY_URL',
  'EXPO_PUBLIC_SUPPORT_URL',
  'IOS_USES_NON_EXEMPT_ENCRYPTION',
];
function withConfig(values: Record<string, string>, run: () => void) {
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, values);
  try {
    run();
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}
const context = {
  config: { name: 'Daily Checker', slug: 'dailychecker', ios: { supportsTablet: true } },
  projectRoot: '/tmp/release-config-test',
  staticConfigPath: null,
  packageJsonPath: null,
};
test('local development does not invent publisher identity or legal answers', () =>
  withConfig({}, () => {
    const app = configure(context);
    assert.equal(app.ios?.bundleIdentifier, undefined);
    assert.equal(app.owner, undefined);
    assert.equal(app.ios?.config?.usesNonExemptEncryption, undefined);
  }));
test('production refuses missing owner/project/legal configuration', () =>
  withConfig({ EAS_BUILD_PROFILE: 'production' }, () => {
    assert.throws(() => configure(context), /Release configuration is incomplete/);
  }));
test('identity format, authenticated URLs and invalid encryption responses are rejected', () => {
  const invalidValues: Record<string, string>[] = [
    { IOS_BUNDLE_IDENTIFIER: 'wrong id' },
    { EAS_PROJECT_ID: 'not-a-uuid' },
    { EXPO_PUBLIC_PRIVACY_POLICY_URL: 'http://localhost/privacy' },
    { EXPO_PUBLIC_SUPPORT_URL: 'https://user:password@publisher.test/support' },
    { IOS_USES_NON_EXEMPT_ENCRYPTION: 'perhaps' },
  ];
  for (const values of invalidValues)
    withConfig(values, () => assert.throws(() => configure(context)));
});
test('explicit owner-provided settings are preserved in the Expo config', () =>
  withConfig(
    {
      IOS_BUNDLE_IDENTIFIER: 'com.example.releasefixture',
      EAS_PROJECT_ID: '00000000-0000-4000-8000-000000000001',
      EXPO_OWNER: 'test-fixture-owner',
      IOS_USES_NON_EXEMPT_ENCRYPTION: 'false',
    },
    () => {
      const app = configure(context);
      assert.equal(app.ios?.bundleIdentifier, 'com.example.releasefixture');
      assert.equal(app.ios?.config?.usesNonExemptEncryption, false);
      assert.equal(app.ios?.supportsTablet, true);
      assert.equal(app.extra?.eas.projectId, '00000000-0000-4000-8000-000000000001');
    },
  ));
