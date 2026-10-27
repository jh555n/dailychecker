import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => JSON.parse(fs.readFileSync(new URL(path, root), 'utf8'));
const metadata = read('release/metadata.ko-KR.json');
const app = read('app.json').expo;
const eas = read('eas.json');
const errors = [];
const blockers = [];
for (const [key, max] of Object.entries({
  name: 30,
  subtitle: 30,
  promotionalText: 170,
  description: 4000,
  keywords: 100,
})) {
  if (typeof metadata[key] !== 'string' || [...metadata[key]].length > max || !metadata[key].trim())
    errors.push(`${key}: missing or exceeds ${max} characters`);
}
const png = fs.readFileSync(new URL('assets/icon.png', root));
if (
  !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
  png.readUInt32BE(16) !== 1024 ||
  png.readUInt32BE(20) !== 1024 ||
  png[25] !== 2
)
  errors.push('Icon must be a 1024×1024 RGB PNG without alpha.');
if (app.version !== '1.0.0' || app.ios.buildNumber !== '1')
  errors.push(
    'Review and update this first-release validation when changing version/build number.',
  );
if (
  eas.build.production.distribution !== 'store' ||
  eas.build.production.credentialsSource !== 'remote' ||
  eas.build.production.ios.simulator !== false
)
  errors.push('iOS store build configuration is invalid.');
for (const name of [
  'IOS_BUNDLE_IDENTIFIER',
  'EXPO_OWNER',
  'EAS_PROJECT_ID',
  'EXPO_PUBLIC_PRIVACY_POLICY_URL',
  'EXPO_PUBLIC_SUPPORT_URL',
  'IOS_USES_NON_EXEMPT_ENCRYPTION',
]) {
  if (!process.env[name]) blockers.push(`Missing confirmed configuration: ${name}`);
}
for (const name of [
  'supportUrl',
  'privacyPolicyUrl',
  'copyright',
  'ascAppId',
  'bundleIdentifier',
  'appleTeamId',
  'sellerDisplayName',
  'sku',
  'pricingDecision',
  'availabilityDecision',
]) {
  if (!metadata[name]) blockers.push(`Owner/account information required: ${name}`);
}
for (const name of [
  'ageRatingOwnerConfirmed',
  'contentRightsOwnerConfirmed',
  'appPrivacyOwnerConfirmed',
  'exportComplianceOwnerConfirmed',
]) {
  if (metadata[name] !== true) blockers.push(`Owner review required: ${name}`);
}
if (metadata.reviewContactConfiguredInAppStoreConnect !== true)
  blockers.push(
    'Private review contact must be entered directly in App Store Connect; do not commit it here.',
  );
for (const [name, envName] of Object.entries({
  bundleIdentifier: 'IOS_BUNDLE_IDENTIFIER',
  privacyPolicyUrl: 'EXPO_PUBLIC_PRIVACY_POLICY_URL',
  supportUrl: 'EXPO_PUBLIC_SUPPORT_URL',
})) {
  if (metadata[name] && process.env[envName] && metadata[name] !== process.env[envName])
    errors.push(`Release metadata ${name} differs from ${envName}.`);
}
if (
  metadata.ascAppId &&
  eas.submit.production.ios.ascAppId &&
  String(metadata.ascAppId) !== String(eas.submit.production.ios.ascAppId)
)
  errors.push('App Store Connect target IDs do not match.');
if (!eas.submit.production.ios.ascAppId)
  blockers.push('Exact App Store Connect app ID has not been set in the iOS submit profile.');
console.log(
  JSON.stringify(
    {
      localArtifactErrors: errors,
      submissionBlockers: blockers,
      accountAccessVerified: false,
      nativeArchiveVerified: false,
      nativeScreenshotsVerified: false,
    },
    null,
    2,
  ),
);
if (errors.length || (!process.argv.includes('--assets-only') && blockers.length))
  process.exitCode = 1;
