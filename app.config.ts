import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER?.trim() || undefined;
  const projectId = process.env.EAS_PROJECT_ID?.trim() || undefined;
  const owner = process.env.EXPO_OWNER?.trim() || undefined;
  const privacyPolicyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || undefined;
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL?.trim() || undefined;
  const encryption = process.env.IOS_USES_NON_EXEMPT_ENCRYPTION?.trim() || undefined;
  if (process.env.EAS_BUILD_PROFILE === 'production') {
    const required = {
      IOS_BUNDLE_IDENTIFIER: bundleIdentifier,
      EAS_PROJECT_ID: projectId,
      EXPO_OWNER: owner,
      EXPO_PUBLIC_PRIVACY_POLICY_URL: privacyPolicyUrl,
      EXPO_PUBLIC_SUPPORT_URL: supportUrl,
      IOS_USES_NON_EXEMPT_ENCRYPTION: encryption,
    };
    const missing = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missing.length)
      throw new Error(
        `Release configuration is incomplete: ${missing.join(', ')}. See release/README.md.`,
      );
  }
  if (bundleIdentifier && !/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+){2,}$/.test(bundleIdentifier))
    throw new Error(
      'IOS_BUNDLE_IDENTIFIER must be an explicitly confirmed reverse-DNS identifier.',
    );
  if (
    projectId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)
  )
    throw new Error('EAS_PROJECT_ID must be the existing EAS project UUID.');
  for (const [name, value] of Object.entries({ privacyPolicyUrl, supportUrl })) {
    if (value) {
      const url = new URL(value);
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        ['localhost', 'example.com', 'example.org'].includes(url.hostname)
      )
        throw new Error(`${name} must be a real public HTTPS URL without credentials.`);
    }
  }
  if (encryption !== undefined && encryption !== 'true' && encryption !== 'false')
    throw new Error('IOS_USES_NON_EXEMPT_ENCRYPTION must be true or false after owner review.');
  return {
    ...config,
    name: config.name ?? 'Daily Checker',
    slug: config.slug ?? 'dailychecker',
    ...(owner ? { owner } : {}),
    ios: {
      ...config.ios,
      ...(bundleIdentifier ? { bundleIdentifier } : {}),
      ...(encryption !== undefined
        ? { config: { ...config.ios?.config, usesNonExemptEncryption: encryption === 'true' } }
        : {}),
    },
    extra: {
      ...config.extra,
      ...(projectId ? { eas: { projectId } } : {}),
    },
  };
};
