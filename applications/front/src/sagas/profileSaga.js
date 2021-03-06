import {
  call,
  delay,
  select,
  take,
  takeEvery,
  takeLeading,
  put,
} from "redux-saga/effects";

// Local imports
import { API_URL } from "../appConfig";
import {
  GOT_JWT,
  ADD_GOT_RES,
  ADD_STATUS_GONE,
  FETCH_WEEK_DONE,
  START_FETCH_WEEK,
  DELETE_FROM_PROFILE,
  START_FETCH_FAVORITES,
  USER_STATE_CHANGED,
} from "../actions/actionTypes";

import {
  fetchWeekDone,
  startFetchWeek,
  fetchWeekFailed,
  startFetchRecipe,
  fetchFavoritesDone,
  fetchFavoritesFailed,
  deleteFromProfileFailed,
  deleteFromProfileSuccess,
} from "../actions/actionCreators";

function* fetchRecipes(action, url, stateKey, successAction, failAction) {
  if (stateKey === "favorites") {
    // Not implemeted
    yield put(successAction([]));
    return;
  }

  const gotAuth = yield select((state) => state.user.gotAuth);
  if (!gotAuth) {
    // Wait for firebase to give us the potential user
    yield take(USER_STATE_CHANGED);
  }

  const loggedIn = yield select((state) => state.user.loggedIn);
  if (!loggedIn) {
    yield put(successAction([]));
    return;
  }

  const recipes = yield select((state) => state.profile[stateKey]);
  if (recipes.length > 0 && !action.force) {
    // This is cached, no need to fetch
    yield put(successAction(recipes));
    return;
  }

  let JWT = yield select((state) => state.user.JWT);
  if (!JWT) {
    // Wait for the JWT to arrive
    JWT = yield take(GOT_JWT);
    JWT = JWT.JWT;
  }

  try {
    let recipes = yield call(fetch, `${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${JWT}`,
      },
    });
    recipes = yield recipes.json();

    if (Array.isArray(recipes)) {
      yield put(successAction(recipes));
    } else {
      throw new Error("could not fetch");
    }
  } catch (err) {
    yield put(failAction(err));
  }
}

function* maybeUpdateProfile(action) {
  if (action.stateKey !== "planRecipeBtn" || !action.res) {
    return;
  }

  // Update it after animations are done
  yield take(ADD_STATUS_GONE);

  // A recipe has been planned! Update profile
  yield put(startFetchWeek(true));
}

function* deleteFromProfile(action, numTries = 0) {
  const gotAuth = yield select((state) => state.user.gotAuth);
  if (!gotAuth) {
    // Wait for firebase to give us the potential user
    yield take(USER_STATE_CHANGED);
  }

  const loggedIn = yield select((state) => state.user.loggedIn);
  if (!loggedIn) {
    yield put(deleteFromProfileFailed());
    return;
  }

  let JWT = yield select((state) => state.user.JWT);
  if (!JWT) {
    // Wait for the JWT to arrive
    JWT = yield take(GOT_JWT);
    JWT = JWT.JWT;
  }

  try {
    let url;
    switch (action.sliderKey) {
      case "week":
        url = "week/remove";
        break;
      case "favorites":
        // change to favorites when the backend is in place
        url = "week/remove";
        break;
      default:
        throw new Error("Unknown sliderkey");
    }

    let res = yield call(fetch, `${API_URL}/${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: action.slug }),
    });
    res = yield res.json();

    if (res.result === true) {
      yield put(deleteFromProfileSuccess());
    } else {
      throw new Error("Could not add");
    }
  } catch (err) {
    if (numTries < 3) {
      yield delay(500 * (numTries + 1));
      yield deleteFromProfile(action, ++numTries);
      return;
    }

    yield put(deleteFromProfileFailed(err));
  }
}

function* preFetchWeek() {
  const week = yield select((state) => state.profile.week);

  for (const recipe of week) {
    // Pre-fetch the recipes of the week so they are always cached
    yield put(startFetchRecipe(recipe.slug, true));
  }
}

export function* profileSaga() {
  yield takeLeading(START_FETCH_WEEK, (action) =>
    fetchRecipes(action, "/week", "week", fetchWeekDone, fetchWeekFailed)
  );

  // Change url to favorites when the backend is implemented
  yield takeLeading(START_FETCH_FAVORITES, (action) =>
    fetchRecipes(
      action,
      "/week",
      "favorites",
      fetchFavoritesDone,
      fetchFavoritesFailed
    )
  );

  yield takeEvery(ADD_GOT_RES, maybeUpdateProfile);

  yield takeEvery(DELETE_FROM_PROFILE, deleteFromProfile);

  yield takeEvery(FETCH_WEEK_DONE, preFetchWeek);
}
