import express from "express";
import querystring from "querystring";
import axios, { AxiosResponse } from "axios";

import {
  Torrent,
  TorrentState,
  TorrentFile,
  TorrentFilePriority,
} from "./types";

const router = express.Router();
const qbittorrentServerUrl = "http://localhost:8080";

const convertTorrentState = (raw_state: any): TorrentState => {
  switch (raw_state) {
    case "error":
      return TorrentState.Error;

    case "pausedUP":
      return TorrentState.Completed;

    case "pausedDL":
      return TorrentState.Paused;

    case "queuedUP":
    case "queuedDL":
    case "queuedForChecking":
      return TorrentState.Queued;

    case "uploading":
    case "forcedUP":
    case "stalledUP":
      return TorrentState.Seeding;

    case "stalledDL":
      return TorrentState.Stalled;

    case "checkingUP":
    case "checkingDL":
    case "checkingResumeData":
      return TorrentState.Checking;

    case "downloading":
    case "forcedDL":
      return TorrentState.Downloading;

    case "metaDL":
      return TorrentState.FetchingMetadata;

    case "allocating":
      return TorrentState.Allocating;

    case "moving":
      return TorrentState.Moving;

    case "missingFiles":
      return TorrentState.MissingFiles;

    case "unknwon":
    default:
      return TorrentState.Unknown;
  }
};

axios.defaults.withCredentials = true;

router.get("/applicationName", async (req, res) => {
  await axios
    .get(`${qbittorrentServerUrl}/api/v2/app/version`)
    .then(async (appVersionRes) => {
      await axios
        .get(`${qbittorrentServerUrl}/api/v2/app/webapiVersion`)
        .then((apiVersionRes) =>
          res.send(
            `qBittorrent ${appVersionRes.data} (API v${apiVersionRes.data})`
          )
        )
        .catch(() => res.status(500).send(null));
    })
    .catch(() => res.status(500).send(null));
});

router.get("/torrents", async (req, res) => {
  await axios
    .get(`${qbittorrentServerUrl}/api/v2/torrents/info`)
    .then(async (torrentsRes) => {
      let torrents: Array<Torrent>;

      torrents = await Promise.all(
        (torrentsRes.data as Array<any>).map(async (rawTorrent) => {
          let rawTorrentGeneric = ((await axios
            .get(
              `${qbittorrentServerUrl}/api/v2/torrents/properties?hash=${rawTorrent.hash}`
            )
            .catch(() => res.status(500).send(null))) as AxiosResponse<any>)
            .data;

          return {
            hash: rawTorrent.hash,
            addDate: new Date(rawTorrent.added_on * 1000),
            completionDate: new Date(rawTorrent.completion_on * 1000),
            bytesDownloaded: rawTorrent.downloaded,
            bytesDownloadedSession: rawTorrent.downloaded_session,
            downloadLimit: rawTorrent.dl_limit,
            uploadLimit: rawTorrent.up_limit,
            eta: rawTorrent.eta,
            forceStart: (rawTorrent as any).force_start as boolean,
            magnetUri: rawTorrent.magnet_uri,
            name: rawTorrent.name,
            priority: rawTorrent.priority,
            progress: rawTorrent.progress,
            savePath: rawTorrent.save_path,
            size: rawTorrent.size,
            state: convertTorrentState(rawTorrent.state),
            downloadSpeed: rawTorrent.dlspeed,
            uploadSpeed: rawTorrent.upspeed,
            bytesUploaded: rawTorrent.uploaded,
            bytesUploadedSession: rawTorrent.uploaded_session,
            timeActive: rawTorrent.time_active,
            downloadSpeedAvg: rawTorrentGeneric.dl_speed_avg,
            uploadSpeedAvg: rawTorrentGeneric.up_speed_avg,
            creationDate: new Date(rawTorrentGeneric.creation_date * 1000),
            createdBy: rawTorrentGeneric.created_by,
            creatorComment: rawTorrentGeneric.comment,
            peers: rawTorrentGeneric.peers,
            totalPeers: rawTorrentGeneric.peers_total,
            seeds: rawTorrentGeneric.seeds,
            totalSeeds: rawTorrentGeneric.seeds_total,
            piecesDownloaded: rawTorrentGeneric.pieces_have,
            totalPieces: rawTorrentGeneric.pieces_num,
            pieceSize: rawTorrentGeneric.piece_size,
            connections: rawTorrentGeneric.nb_connections,
            connectionsLimit: rawTorrentGeneric.nb_connections_limit,
          };
        })
      );

      res.send(torrents);
    })
    .catch(() => res.status(500).send(null));
});

router.get("/torrent/:torrentHash/files", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/files?hash=${req.params.torrentHash}`
    )
    .then((torrentFilesRes) => {
      let torrentFiles: Array<TorrentFile>;

      torrentFiles = (torrentFilesRes.data as Array<any>).map(
        (torrentFile) => ({
          name: (torrentFile.name as string).replace(/\.unwanted[\\/]+/, ""),
          priority:
            torrentFile.priority === 4
              ? TorrentFilePriority.Normal
              : (torrentFile.priority as TorrentFilePriority),
          progress: torrentFile.progress,
          availability: torrentFile.availability,
          size: torrentFile.size,
        })
      );

      res.send(torrentFiles);
    })
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/resume", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/resume?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/pause", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/pause?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/delete", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/delete?hashes=${
        req.params.torrentHash
      }&deleteFiles=${req.body ? req.body.deleteFiles : false}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/increasePriority", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/increasePrio?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/decreasePriority", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/decreasePrio?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/maxPriority", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/topPrio?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/minPriority", async (req, res) => {
  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/bottomPrio?hashes=${req.params.torrentHash}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/setSavePath", async (req, res) => {
  if (!req.body || !req.body.savePath) {
    res.status(400).send(null);
    return;
  }

  await axios
    .post(
      `${qbittorrentServerUrl}/api/v2/torrents/setLocation`,
      querystring.stringify({
        hashes: req.params.torrentHash,
        location: req.body.savePath,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/setName", async (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).send(null);
    return;
  }

  await axios
    .post(
      `${qbittorrentServerUrl}/api/v2/torrents/rename`,
      querystring.stringify({
        hash: req.params.torrentHash,
        name: req.body.name,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/setDownloadLimit", async (req, res) => {
  if (
    !req.body ||
    !(req.body.limit !== undefined && typeof req.body.limit === "number")
  ) {
    res.status(400).send(null);
    return;
  }

  await axios
    .post(
      `${qbittorrentServerUrl}/api/v2/torrents/setDownloadLimit`,
      querystring.stringify({
        hashes: req.params.torrentHash,
        limit: parseInt(req.body.limit),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/setUploadLimit", async (req, res) => {
  if (
    !req.body ||
    !(req.body.limit !== undefined && typeof req.body.limit === "number")
  ) {
    res.status(400).send(null);
    return;
  }

  await axios
    .post(
      `${qbittorrentServerUrl}/api/v2/torrents/setUploadLimit`,
      querystring.stringify({
        hashes: req.params.torrentHash,
        limit: parseInt(req.body.limit),
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/setFilesPriority", async (req, res) => {
  if (
    !req.body ||
    !(
      req.body.ids &&
      Array.isArray(req.body.ids) &&
      (req.body.ids as Array<any>).every((val) => typeof val === "number")
    ) ||
    !(
      req.body.priority !== undefined &&
      typeof req.body.priority === "number" &&
      req.body.priority in TorrentFilePriority
    )
  ) {
    res.status(400).send(null);
    return;
  }

  const ids: Array<number> = req.body.ids;
  const priority: TorrentFilePriority = req.body.priority;

  await axios
    .get(
      `${qbittorrentServerUrl}/api/v2/torrents/filePrio?hash=${
        req.params.torrentHash
      }&id=${ids.join("|")}&priority=${priority}`
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

router.post("/torrent/:torrentHash/renameFile", async (req, res) => {
  if (
    !req.body ||
    !(req.body.id !== undefined && typeof req.body.id === "number") ||
    !(req.body.name !== undefined && typeof req.body.name === "string")
  ) {
    res.status(400).send(null);
    return;
  }

  const id: number = req.body.id;
  const name: string = req.body.name;

  await axios
    .post(
      `${qbittorrentServerUrl}/api/v2/torrents/renameFile`,
      querystring.stringify({
        hash: req.params.torrentHash,
        id,
        name,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then(() => res.send(null))
    .catch(() => res.status(400).send(null));
});

export default router;