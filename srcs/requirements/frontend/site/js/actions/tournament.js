import { authFetchJson, handleError } from "../api.js";
import { TournamentUI } from "../ui/TournamentUI.js";

export const tournamentActions = [
  {
    selector: '[data-action="tournament-action"]',
    handler: handleTournamentAction,
  },
  {
    selector: '#tournament-section [data-bs-toggle="pill"]',
    handler: switchTournamentTab,
  },
];

export function initTournament() {
  fetchAndDisplayTournaments("available");
}

const TABS = {
  available: "api/tournament/display_available/",
  registered: "api/tournament/display_registered/",
  ongoing: "api/tournament/display_ongoing/",
  history: "api/tournament/display_history/",
};

function displayTournaments(data, tabKey) {
  const tournaments = data.results;
  const container = document.getElementById(`pills-${tabKey}`);
  container.innerHTML = tournaments
    .map((t) => TournamentUI.createCard(t, tabKey))
    .join("");
}

async function fetchAndDisplayTournaments(tab) {
  try {
    const apiPath = TABS[tab];
    if (!apiPath) return;
    const tournaments = await authFetchJson(apiPath);
    displayTournaments(tournaments, tab);
  } catch (error) {
    handleError(error, "Display user error");
  }
}

function switchTournamentTab(element, event) {
  const tabKey = element.dataset.tab;
  if (!TABS[tabKey]) return;

  console.log(`Switching to tab: ${tabKey}`);
  fetchAndDisplayTournaments(tabKey);
}

const tournamentActionMap = {
  register: {
    path: "register",
    message: "You joined the tournament",
    tab: "available",
  },
  unregister: {
    path: "unregister",
    message: "You left the tournament",
    tab: "registered",
  },
};

async function handleTournamentAction(element) {
  const tournament_id = parseInt(element.dataset.id, 10);
  const actionType = element.dataset.type;
  if (!tournament_id || !tournamentActionMap[actionType]) {
    console.error(`Invalid action: ${actionType} for tournament ${tournament_id}`);
    return;
  }

  const { path, message, tab } = tournamentActionMap[actionType];
  try {
    const response = await authFetchJson(`api/tournament/${path}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournament_id }),
    });
    console.log(message + ": ", response);
    await fetchAndDisplayTournaments(tab);
  } catch (error) {
    handleError("Error in tournament action");
  }
}