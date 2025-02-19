// Spotify API Credentials
const CLIENT_ID = "c2249a3c98fc40c09d4f791dd4bcbaaa";
const CLIENT_SECRET = "c4d54f70d0c5449e81d8693ac632d643";
let accessToken = "";

// YouTube API Key 
const YOUTUBE_API_KEY = "AIzaSyApqciP0pFplK76zr_6K5jQS6LekxDoOIE";

//Spotify Access Token
async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    });

    const data = await response.json();
    accessToken = data.access_token;
}

// Fetch Playlist Based on Mood
async function fetchPlaylist(mood) {
    const moodMap = {
        happy: "party",
        sad: "sad",
        energetic: "workout",
        relaxed: "chill"
    };

    const query = moodMap[mood] || mood; // predefined moods or custom user input
    const url = `https://api.spotify.com/v1/search?q=${query}&type=playlist&limit=1`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    if (data.playlists.items.length > 0) {
        const playlistId = data.playlists.items[0].id;
        fetchPlaylistTracks(playlistId);
    } else {
        document.getElementById("playlist-results").innerHTML = `<p>No playlist found for "${mood}".</p>`;
    }
}

// Fetch Tracks from Playlist
async function fetchPlaylistTracks(playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    displaySongs(data.items);
}

// Display Songs on the Page
function displaySongs(tracks) {
    const playlistContainer = document.getElementById("playlist-results");
    playlistContainer.innerHTML = ""; // Clear previous results

    tracks.slice(0, 6).forEach(track => {
        if (!track.track) return; // Ignore empty tracks

        const songCard = document.createElement("div");
        songCard.classList.add("song-card");

        const trackImage = track.track.album.images[0].url;
        const trackName = track.track.name;
        const trackArtists = track.track.artists.map(artist => artist.name).join(", ");
        const trackPreview = track.track.preview_url;
        const trackLink = track.track.external_urls.spotify; // Full track link, spotify not allow to reproduce more than 30 sec in a diferent browser.

        songCard.innerHTML = `
            <img src="${trackImage}" alt="${trackName}">
            <h3>${trackName}</h3>
            <p>${trackArtists}</p>
            ${trackPreview ? `
                <audio controls>
                    <source src="${trackPreview}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>` 
                : `<a href="${trackLink}" target="_blank" class="spotify-btn">🎧 Listen on Spotify</a>`}
        `;

        playlistContainer.appendChild(songCard);
    });
}

// Fetch YouTube Videos Based on Mood
async function getYouTubeVideos(mood) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${mood} music&part=snippet&type=video&maxResults=3`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items.length > 0) {
        displayYouTubeVideos(data.items);
    } else {
        document.getElementById("youtube-results").innerHTML = `<p>No videos found for "${mood}".</p>`;
    }
}

// Display YouTube Videos on the Page
function displayYouTubeVideos(videos) {
    const youtubeContainer = document.getElementById("youtube-results");
    youtubeContainer.innerHTML = ""; // Clear previous results

    videos.forEach(video => {
        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;
        const videoThumbnail = video.snippet.thumbnails.medium.url;

        const videoCard = document.createElement("div");
        videoCard.classList.add("video-card");
        videoCard.innerHTML = `
            <img src="${videoThumbnail}" alt="${videoTitle}">
            <h3>${videoTitle}</h3>
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Watch on YouTube</a>
        `;
        
        youtubeContainer.appendChild(videoCard);
    });
}

// Event Listeners for Mood Buttons
document.querySelectorAll(".mood-btn").forEach(button => {
    button.addEventListener("click", () => {
        fetchPlaylist(button.dataset.mood);
        getYouTubeVideos(button.dataset.mood);
    });
});

// Event Listener for Custom Mood Inputs
document.getElementById("generate-btn").addEventListener("click", () => {
    const moodInput = document.getElementById("custom-mood").value.trim();
    if (moodInput) {
        fetchPlaylist(moodInput);
        getYouTubeVideos(moodInput);
    }
});


// Get Spotify Token on Page Load
window.onload = getAccessToken;

function saveToLocalStorage(mood, playlist) {
    localStorage.setItem("lastMood", mood);
    localStorage.setItem("lastPlaylist", JSON.stringify(playlist));
    
    // Debugging: Check if Local Storage is updated
    console.log("Saved to Local Storage:", { mood, playlist });
}

