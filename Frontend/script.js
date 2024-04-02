let total = document.getElementById("num"),
  totalTime = document.getElementById("tym"),
  avgTime = document.getElementById("len"),
  t125 = document.getElementById("t1"),
  t15 = document.getElementById("t2"),
  t175 = document.getElementById("t3"),
  t2 = document.getElementById("t4"),
  input = document.getElementById("playlistIdInput");

document.getElementById("fetch").addEventListener("click", () => {
  let queryLink = input.value;
  if(queryLink === "")return;
  let playlistId = getPlaylistIdFromUrl(queryLink);
  fetchPlaylistData(playlistId);
})
document.getElementById("fetch-tab").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    queryLink = tabs[0].url
    let playlistId = getPlaylistIdFromUrl(queryLink);
    if(playlistId == null) {
      console.log("wrong url");
      return;
    }
    fetchPlaylistData(playlistId);
  })
})

async function fetchPlaylistData(playlistId) {
  // const playlistId = document.getElementById('playlistIdInput').value;
  const response = await fetch(`http://localhost:3000/?playlistId=${playlistId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch playlist data');
  }
  const data = await response.json();
  console.log('Playlist data:', data);
  total.textContent = data.totalVideos;
  const totalTime = calculateTotalTime(data.videoTime);
  const time = calculateTimeTaken(totalTime);
  avgTime.textContent = formatDuration(totalTime / data.totalVideos);
  tym.textContent = time["1x"]
  t125.textContent = time["1.25x"]
  t15.textContent = time["1.5x"]
  t175.textContent = time["1.75x"]
  t2.textContent = time["2x"]
}
function calculateTotalTime(timeArray) {
  let totalSeconds = 0;

  //calculate total seconds
  timeArray.forEach(timeObj => {
    if (timeObj !== null) {
      totalSeconds += timeObj.hours * 3600 + timeObj.minutes * 60 + timeObj.seconds;
    }
  });
  return totalSeconds;
}
function calculateTimeTaken(durationInSeconds) {
  const speeds = [1, 1.25, 1.5, 1.75, 2];
  const timeTaken = {};

  for (const speed of speeds) {
    const time = durationInSeconds / speed;
    const formattedTime = formatDuration(time);
    timeTaken[`${speed}x`] = formattedTime;
  }

  return timeTaken;
}
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
}
function getPlaylistIdFromUrl(urlOrId) {
  // Check if the input is a URL
  if (urlOrId.includes("youtube.com") && urlOrId.includes("list=")) {
    const regex = /[&?]list=([^&]+)/;
    const match = urlOrId.match(regex);
    if (match) {
      return match[1];
    }
  } else if (!urlOrId.includes("youtube.com") && !urlOrId.includes("list=")) { // If it's not a URL and doesn't contain "list=" assume it's a pure ID
    return urlOrId;
  }
  return null; // Return null if it's not a YouTube link or pure ID
}


