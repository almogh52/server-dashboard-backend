import express from "express";
import querystring from "querystring";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";

import {
  Torrent,
  TorrentState,
  TorrentFile,
  TorrentFilePriority,
  Preferences,
  Category,
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

router.get("/application/info", async (req, res) => {
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

router.get("/application/preferences", async (req, res) => {
  await axios
    .get(`${qbittorrentServerUrl}/api/v2/app/preferences`)
    .then((prefsRes) => {
      let prefs: Preferences;

      prefs = {
        locale: prefsRes.data.locale,
        createSubfolderEnabled: prefsRes.data.create_subfolder_enabled,
        startPausedEnabled: prefsRes.data.start_paused_enabled,
        autoDeleteMode: prefsRes.data.auto_delete_mode,
        preallocateAll: prefsRes.data.preallocate_all,
        incompleteFilesExt: prefsRes.data.incomplete_files_ext,
        autoTmmEnabled: prefsRes.data.auto_tmm_enabled,
        torrentChangedTmmEnabled: prefsRes.data.torrent_changed_tmm_enabled,
        savePathChangedTmmEnabled: prefsRes.data.save_path_changed_tmm_enabled,
        categoryChangedTmmEnabled: prefsRes.data.category_changed_tmm_enabled,
        savePath: prefsRes.data.save_path,
        tempPathEnabled: prefsRes.data.temp_path_enabled,
        tempPath: prefsRes.data.temp_path,
        scanDirs: prefsRes.data.scan_dirs,
        exportDir: prefsRes.data.export_dir,
        exportDirFin: prefsRes.data.export_dir_fin,
        mailNotificationEnabled: prefsRes.data.mail_notification_enabled,
        mailNotificationSender: prefsRes.data.mail_notification_sender,
        mailNotificationEmail: prefsRes.data.mail_notification_email,
        mailNotificationSmtp: prefsRes.data.mail_notification_smtp,
        mailNotificationSslEnabled: prefsRes.data.mail_notification_ssl_enabled,
        mailNotificationAuthEnabled:
          prefsRes.data.mail_notification_auth_enabled,
        mailNotificationUsername: prefsRes.data.mail_notification_username,
        mailNotificationPassword: prefsRes.data.mail_notification_password,
        autorunEnabled: prefsRes.data.autorun_enabled,
        autorunProgram: prefsRes.data.autorun_program,
        queueingEnabled: prefsRes.data.queueing_enabled,
        maxActiveDownloads: prefsRes.data.max_active_downloads,
        maxActiveTorrents: prefsRes.data.max_active_torrents,
        maxActiveUploads: prefsRes.data.max_active_uploads,
        dontCountSlowTorrents: prefsRes.data.dont_count_slow_torrents,
        slowTorrentDownloadRateThreshold:
          prefsRes.data.slow_torrent_dl_rate_threshold,
        slowTorrentUploadRateThreshold:
          prefsRes.data.slow_torrent_ul_rate_threshold,
        slowTorrentInactiveTimer: prefsRes.data.slow_torrent_inactive_timer,
        maxRatioEnabled: prefsRes.data.max_ratio_enabled,
        maxRatio: prefsRes.data.max_ratio,
        maxRatioAct: prefsRes.data.max_ratio_act,
        listenPort: prefsRes.data.listen_port,
        upnp: prefsRes.data.upnp,
        randomPort: prefsRes.data.random_port,
        downloadLimit: prefsRes.data.dl_limit,
        uploadLimit: prefsRes.data.up_limit,
        maxConnections: prefsRes.data.max_connec,
        maxConnectionsPerTorrent: prefsRes.data.max_connec_per_torrent,
        maxUploads: prefsRes.data.max_uploads,
        maxUploadsPerTorrent: prefsRes.data.max_uploads_per_torrent,
        stopTrackerTimeout: prefsRes.data.stop_tracker_timeout,
        pieceExtentAffinity: prefsRes.data.piece_extent_affinity,
        enableUtp: prefsRes.data.enable_utp,
        limitUtpRate: prefsRes.data.limit_utp_rate,
        limitTcpOverhead: prefsRes.data.limit_tcp_overhead,
        limitLanPeers: prefsRes.data.limit_lan_peers,
        altDownloadLimit: prefsRes.data.alt_dl_limit,
        altUploadLimit: prefsRes.data.alt_up_limit,
        schedulerEnabled: prefsRes.data.scheduler_enabled,
        scheduleFromHour: prefsRes.data.schedule_from_hour,
        scheduleFromMin: prefsRes.data.schedule_from_min,
        scheduleToHour: prefsRes.data.schedule_to_hour,
        scheduleToMin: prefsRes.data.schedule_to_min,
        schedulerDays: prefsRes.data.scheduler_days,
        dht: prefsRes.data.dht,
        dhtSameAsBt: prefsRes.data.dht_same_as_bt,
        dhtPort: prefsRes.data.dht_port,
        pex: prefsRes.data.pex,
        lsd: prefsRes.data.lsd,
        encryption: prefsRes.data.encryption,
        anonymousMode: prefsRes.data.anonymous_mode,
        proxyType: prefsRes.data.proxy_type,
        proxyIp: prefsRes.data.proxy_ip,
        proxyPort: prefsRes.data.proxy_port,
        proxyPeerConnections: prefsRes.data.proxy_peer_connections,
        forceProxy: prefsRes.data.force_proxy,
        proxyAuthEnabled: prefsRes.data.proxy_auth_enabled,
        proxyUsername: prefsRes.data.proxy_username,
        proxyPassword: prefsRes.data.proxy_password,
        ipFilterEnabled: prefsRes.data.ip_filter_enabled,
        ipFilterPath: prefsRes.data.ip_filter_path,
        ipFilterTrackers: prefsRes.data.ip_filter_trackers,
        webUiDomainList: prefsRes.data.web_ui_domain_list,
        webUiAddress: prefsRes.data.web_ui_address,
        webUiPort: prefsRes.data.web_ui_port,
        webUiUpnp: prefsRes.data.web_ui_upnp,
        webUiUsername: prefsRes.data.web_ui_username,
        webUiPassword: prefsRes.data.web_ui_password,
        webUiCsrfProtectionEnabled:
          prefsRes.data.web_ui_csrf_protection_enabled,
        webUiClickjackingProtectionEnabled:
          prefsRes.data.web_ui_clickjacking_protection_enabled,
        webUiSecureCookieEnabled: prefsRes.data.web_ui_secure_cookie_enabled,
        webUiMaxAuthFailCount: prefsRes.data.web_ui_max_auth_fail_count,
        webUiBanDuration: prefsRes.data.web_ui_ban_duration,
        bypassLocalAuth: prefsRes.data.bypass_local_auth,
        bypassAuthSubnetWhitelistEnabled:
          prefsRes.data.bypass_auth_subnet_whitelist_enabled,
        bypassAuthSubnetWhitelist: prefsRes.data.bypass_auth_subnet_whitelist,
        alternativeWebuiEnabled: prefsRes.data.alternative_webui_enabled,
        alternativeWebuiPath: prefsRes.data.alternative_webui_path,
        useHttps: prefsRes.data.use_https,
        sslKey: prefsRes.data.ssl_key,
        sslCert: prefsRes.data.ssl_cert,
        dyndnsEnabled: prefsRes.data.dyndns_enabled,
        dyndnsService: prefsRes.data.dyndns_service,
        dyndnsUsername: prefsRes.data.dyndns_username,
        dyndnsPassword: prefsRes.data.dyndns_password,
        dyndnsDomain: prefsRes.data.dyndns_domain,
        rssRefreshInterval: prefsRes.data.rss_refresh_interval,
        rssMaxArticlesPerFeed: prefsRes.data.rss_max_articles_per_feed,
        rssProcessingEnabled: prefsRes.data.rss_processing_enabled,
        rssAutoDownloadingEnabled: prefsRes.data.rss_auto_downloading_enabled,
      };

      res.send(prefs);
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

router.post("/torrents/add", async (req, res) => {
  if (
    !req.body ||
    (!(
      Array.isArray(req.body.links) &&
      (req.body.links as Array<any>).every((val) => typeof val === "string")
    ) &&
      !(
        Array.isArray(req.body.files) &&
        (req.body.files as Array<any>).every(
          (val) =>
            Array.isArray(val) &&
            (val as Array<any>).length === 2 &&
            (val as Array<any>).every((val2) => typeof val2 === "string")
        )
      ))
  ) {
    res.status(400).send(null);
    return;
  }

  const links: Array<string> = req.body.links;
  const files: Array<[string, string]> = req.body.files;
  const savePath: string = req.body.savePath;
  const downloadCookie: string = req.body.downloadCookie;
  const category: string = req.body.category;
  const skipHashCheck: boolean = req.body.skipHashCheck;
  const startTorrent: boolean = req.body.startTorrent;
  const createSubfolder: boolean = req.body.createSubfolder;
  const autoManage: boolean = req.body.autoManage;
  const downloadEdgeFirst: boolean = req.body.downloadEdgeFirst;
  const downloadSeqOrder: boolean = req.body.downloadSeqOrder;
  const torrentName: string = req.body.torrentName;
  const downloadLimit: number = req.body.downloadLimit;
  const uploadLimit: number = req.body.uploadLimit;

  const formData = new FormData();

  if (links) {
    formData.append("urls", links.filter((link) => link.length > 0).join("\n"));
  }

  if (files) {
    files.forEach((file) => {
      let fileBuffer = Buffer.from(file[1], "base64");
      formData.append("torrents", fileBuffer, { filename: file[0] });
    });
  }

  if (typeof savePath === "string" && savePath.length > 0) {
    formData.append("savepath", savePath);
  }

  if (typeof downloadCookie === "string" && downloadCookie.length > 0) {
    formData.append("cookie", downloadCookie);
  }

  if (typeof category === "string" && category.length > 0) {
    formData.append("category", category);
  }

  if (typeof skipHashCheck === "boolean") {
    formData.append("skip_checking", skipHashCheck.toString());
  }

  if (typeof startTorrent === "boolean") {
    formData.append("paused", (!startTorrent).toString());
  }

  if (typeof createSubfolder === "boolean") {
    formData.append("root_folder", createSubfolder.toString());
  }

  if (typeof torrentName === "string" && torrentName.length > 0) {
    formData.append("rename", torrentName);
  }

  if (typeof downloadLimit === "number" && downloadLimit > 0) {
    formData.append("dlLimit", downloadLimit.toString());
  }

  if (typeof uploadLimit === "number" && uploadLimit > 0) {
    formData.append("upLimit", uploadLimit.toString());
  }

  if (typeof autoManage === "boolean") {
    formData.append("autoTMM", autoManage.toString());
  }

  if (typeof downloadSeqOrder === "boolean") {
    formData.append("sequentialDownload", downloadSeqOrder.toString());
  }

  if (typeof downloadEdgeFirst === "boolean") {
    formData.append("firstLastPiecePrio", downloadEdgeFirst.toString());
  }

  await axios
    .post(`${qbittorrentServerUrl}/api/v2/torrents/add`, formData, {
      headers: {
        ...formData.getHeaders(),
        "Content-Length": formData.getLengthSync(),
      },
    })
    .then((addRes) =>
      addRes.data === "Fails." ? res.status(400).send(null) : res.send(null)
    )
    .catch(() => res.status(400).send(null));
});

router.get("/categories", async (req, res) => {
  await axios
    .get(`${qbittorrentServerUrl}/api/v2/torrents/categories`)
    .then((categoriesRes) => {
      const rawCategories: { [key: string]: Category } = categoriesRes.data;

      let categories: Array<Category> = [];
      Object.entries(rawCategories).forEach(([, category]) =>
        categories.push(category)
      );
      res.send(categories);
    })
    .catch(() => res.status(500).send(null));
});

export default router;
