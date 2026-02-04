import { generateCoverageSummaryBadge, generateTypedocBadge, generateNpmBadge } from "./generate-badges";

test('generateCoverageSummaryBadge test', async () => {
  const result = await generateCoverageSummaryBadge();
  expect(result).toBe(undefined);
});

test('generateTypedocBadge test', async () => {
  const result = await generateTypedocBadge();
  expect(result).toBe(undefined);
});

test('generateNpmBadge test', async () => {
  const result = await generateNpmBadge();
  expect(result).toBe(undefined);
});