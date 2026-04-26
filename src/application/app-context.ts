import { createCatalogRepository } from "./catalog-repository";
import { createProfileRepository } from "./profile-repository";
import { createUiStateRepository } from "./ui-state-repository";
import { createAppStore } from "./app-store";
import { createStatsEngine } from "../domain/stats-engine";

export function createAppContext({
  fetchImpl = window.fetch.bind(window),
  storage = window.localStorage,
  sessionStorageImpl = window.sessionStorage,
} = {}) {
  const profileRepository = createProfileRepository(storage);
  const uiStateRepository = createUiStateRepository(storage, sessionStorageImpl);

  return {
    fetchImpl,
    storage,
    sessionStorage: sessionStorageImpl,
    catalogRepository: createCatalogRepository(fetchImpl),
    profileRepository,
    uiStateRepository,
    store: createAppStore({}),
    statsEngine: createStatsEngine(),
  };
}
