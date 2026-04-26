import { createCatalogRepository } from "./catalog-repository";
import { createProfileRepository } from "./profile-repository";
import { createUiStateRepository } from "./ui-state-repository";

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
  };
}
