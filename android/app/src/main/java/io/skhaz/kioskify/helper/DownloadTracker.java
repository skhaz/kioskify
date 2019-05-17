package io.skhaz.kioskify.helper;

import android.content.Context;
import android.net.Uri;
import android.webkit.MimeTypeMap;
import android.webkit.URLUtil;

import com.google.android.exoplayer2.offline.Download;
import com.google.android.exoplayer2.offline.DownloadCursor;
import com.google.android.exoplayer2.offline.DownloadHelper;
import com.google.android.exoplayer2.offline.DownloadIndex;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadRequest;
import com.google.android.exoplayer2.offline.DownloadService;
import com.google.android.exoplayer2.util.Util;

import java.io.IOException;
import java.util.HashMap;

import io.skhaz.kioskify.service.SilentDownloadService;

public class DownloadTracker implements DownloadManager.Listener {

    private final Context context;

    private final HashMap<Uri, Download> downloads = new HashMap<>();

    public DownloadTracker(Context context, DownloadManager downloadManager) {
        this.context = context.getApplicationContext();

        downloadManager.addListener(new DownloadManagerListener());

        DownloadIndex downloadIndex = downloadManager.getDownloadIndex();

        try (DownloadCursor loadedDownloads = downloadIndex.getDownloads()) {
            while (loadedDownloads.moveToNext()) {
                Download download = loadedDownloads.getDownload();
                downloads.put(download.request.uri, download);
            }
        } catch (IOException ignore) {
            // ...
        }
    }

    public boolean isDownloaded(String url) {
        Download download = downloads.get(Uri.parse(url));
        return download != null && download.state != Download.STATE_FAILED;
    }

    public void addDownload(String url) {
        if (!URLUtil.isValidUrl(url) || isDownloaded(url)) {
            return;
        }

        DownloadHelper downloadHelper = DownloadHelper.forProgressive(Uri.parse(url));

        String name = URLUtil.guessFileName(url, null, MimeTypeMap.getFileExtensionFromUrl(url));

        DownloadRequest downloadRequest = downloadHelper.getDownloadRequest(Util.getUtf8Bytes(name));

        DownloadService.sendAddDownload(
                context, SilentDownloadService.class, downloadRequest, false);
    }

    public void removeDownload(String url) {
        if (!URLUtil.isValidUrl(url) || isDownloaded(url)) {
            return;
        }

        Download download = downloads.get(Uri.parse(url));

        if (download == null) {
            return;
        }

        DownloadService.sendRemoveDownload(
                context, SilentDownloadService.class, download.request.id, false);
    }

    private class DownloadManagerListener implements DownloadManager.Listener {

        @Override
        public void onDownloadChanged(DownloadManager downloadManager, Download download) {
            downloads.put(download.request.uri, download);
        }

        @Override
        public void onDownloadRemoved(DownloadManager downloadManager, Download download) {
            downloads.remove(download.request.uri);
        }
    }
}
