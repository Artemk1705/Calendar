import React, { useState, useEffect } from "react";

function App() {
  const API_KEY = "ce81a80d238546ae8483df0158f41bbb";

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const stripHtmlTags = (input) => {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.body.textContent || "";
  };

  const fetchGamesForMonth = async (year, month) => {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?dates=${year}-${month + 1}-01,${year}-${
          month + 1
        }-30&key=${API_KEY}`
      );
      const data = await response.json();
      const gamesData = data.results.filter((game) => game.background_image);
      setGames(gamesData);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const openModal = (game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedGame(null);
    setModalVisible(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      } else {
        return prevMonth - 1;
      }
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      } else {
        return prevMonth + 1;
      }
    });
  };

  useEffect(() => {
    fetchGamesForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const gameElements = document.querySelectorAll(".game");
    gameElements.forEach((gameEl) => {
      gameEl.addEventListener("click", () => {
        const gameId = gameEl.getAttribute("data-id");
        const selectedGame = games.find(
          (game) => game.id.toString() === gameId
        );

        if (selectedGame) {
          openModal(selectedGame);
        }
      });
    });
    return () => {
      gameElements.forEach((gameEl) => {
        gameEl.removeEventListener("click", () => {});
      });
    };
  }, [games]);
  return (
    <div>
      <h1>Video Games Release Calendar</h1>
      <div className="controls">
        <button id="prevMonth" onClick={handlePrevMonth}>
          Previus
        </button>
        <span id="currentMonthYear">
          {`${monthNames[currentMonth]} ${currentYear}`}
        </span>
        <button id="nextMonth" onClick={handleNextMonth}>
          Next
        </button>
      </div>

      {games && games.length > 0 ? (
        <div id="calendar">
          {games.map((game, index) => (
            <div key={index} className="date">
              <strong>{index + 1}</strong>
              <div className="game" onClick={() => openModal(game)}>
                <img
                  src={game.background_image}
                  alt={`${game.name} Thumbnail`}
                />
                <div className="game-details">{game.name}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No games available for the selected month.</p>
      )}

      {selectedGame && (
        <div id="gameModal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <img
              src={selectedGame.background_image}
              alt={`${selectedGame.name} Thumbnail`}
              id="gameImage"
            />
            <h2 id="gameTitle">{selectedGame.name}</h2>
            <p>
              <strong>Description:</strong>{" "}
              <span id="gameDescription">
                {stripHtmlTags(
                  selectedGame.description || "No description available."
                )}
              </span>
            </p>
            <p>
              <strong>Release Date:</strong>{" "}
              <span id="gameReleaseDate">{selectedGame.released}</span>
            </p>
            <p>
              <strong>Rating:</strong>{" "}
              <span id="gameRating">{selectedGame.rating}</span>
            </p>
            <p>
              <strong>Platforms:</strong>{" "}
              <span id="gamePlatforms">
                {selectedGame.platforms
                  .map((platform) => platform.platform.name)
                  .join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
