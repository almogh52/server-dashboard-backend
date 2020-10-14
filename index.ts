import express from "express";

import qbittorrentRoutes from "./routes/qbittorrent/routes";

const app = express();
const port = 4000;

app.use(express.json());

app.use("/api/qbittorrent", qbittorrentRoutes);

app.listen(port, () => {
  console.log(`Server dashboard listening at http://localhost:${port}`);
});
