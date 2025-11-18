import { goto } from '$app/navigation';
import { AppRoute } from '$lib/constants';
import { featureFlagsManager } from '$lib/managers/feature-flags-manager.svelte';
import { handlePromiseError } from '$lib/utils';
import { authenticate } from '$lib/utils/auth';
import { getFormatter } from '$lib/utils/i18n';
import { getAssetInfoFromParam } from '$lib/utils/navigation';
import type { PageLoad } from './$types';

export const load = (async ({ params, url, parent }) => {
  await authenticate(url);
  const asset = await getAssetInfoFromParam(params);
  const $t = await getFormatter();

  // layout.ts and this load function run concurrently by default, causing a race condition
  // between accessing and initializing the `featureFlagsManager`.
  // By explicitly awaiting the parent a strict order can be enforced
  await parent();
  if (!featureFlagsManager.value.trash) {
    handlePromiseError(goto(AppRoute.PHOTOS));
  }

  return {
    asset,
    meta: {
      title: $t('trash'),
    },
  };
}) satisfies PageLoad;
