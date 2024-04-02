import express from 'express';
import axios from 'axios';
import cors from "cors";

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors())
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', async (req, res) => {
  try {
    // let playlistId = `PLeR-H2WqA8sNzkIhNA0TwW44oitkknc8G`;
    // let playlistId = `PLEfLKs5h9aP4PBWI3mToQoFYmzOe9K_qF`;
    // let playlistId = `PLZlA0Gpn_vH8DWL14Wud_m8NeNNbYKOkj`; 
    let playlistId = req.query.playlistId;
    let apiKey = process.env.API_KEY;
    let apiURL = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    
    let response = await axios.get(apiURL);
    let playlistData = response.data;

    let videoURLs = [];
    for (let i = 0; i < playlistData.items.length; i++) {
      let videoID = playlistData.items[i].snippet.resourceId.videoId;
      let videoApiURL = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoID}&key=${apiKey}`
      videoURLs[i] = videoApiURL;
    }

    let videoTime = [];
    for (let i = 0; i < videoURLs.length; i++) {
      let videoRes = await axios.get(videoURLs[i]);
      let videoData =  videoRes.data.items[0];  
      if(videoData){
        videoTime[i] = parseDuration(videoData.contentDetails.duration); 
      }                
    }    
    let data = {
      totalVideos: playlistData.items.length,
      videoAPIURLs: videoURLs,
      videoTime: videoTime
    }
    // res.json(data);
    res.send(data); 
  }
  catch (err) {    
    console.error(err); 
  }
});

function parseDuration(duration) {
  let h = 0, m = 0, s = 0;
  let match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);  
  h = (parseInt(match[1]) || 0);
  m = (parseInt(match[2]) || 0);
  s = (parseInt(match[3]) || 0);
  let timeObj = {
    hours: h,
    minutes: m,
    seconds: s
  }
  return timeObj;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
