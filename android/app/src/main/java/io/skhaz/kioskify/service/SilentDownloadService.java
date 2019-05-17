package io.skhaz.kioskify.service;

import android.app.Notification;

import com.google.android.exoplayer2.offline.Download;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadService;
import com.google.android.exoplayer2.scheduler.PlatformScheduler;
import com.google.android.exoplayer2.ui.DownloadNotificationHelper;
import com.google.android.exoplayer2.util.Util;

import java.util.List;

import io.skhaz.kioskify.R;
import io.skhaz.kioskify.application.Application;

public class SilentDownloadService extends DownloadService {

    private static final String CHANNEL_ID = "download_channel";

    private static final int JOB_ID = 1001;

    private static final int FOREGROUND_NOTIFICATION_ID = 1;

    private DownloadNotificationHelper notificationHelper;

    public SilentDownloadService() {
        super(
                FOREGROUND_NOTIFICATION_ID,
                DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL,
                CHANNEL_ID,
                R.string.exo_download_notification_channel_name
        );
    }

    @Override
    public void onCreate() {
        super.onCreate();

        notificationHelper = new DownloadNotificationHelper(this, CHANNEL_ID);
    }

    @Override
    protected DownloadManager getDownloadManager() {
        return ((Application) getApplication()).getDownloadManager();
    }

    @Override
    protected PlatformScheduler getScheduler() {
        return Util.SDK_INT >= 21 ? new PlatformScheduler(this, JOB_ID) : null;
    }

    @Override
    protected Notification getForegroundNotification(List<Download> downloads) {
        return notificationHelper.buildProgressNotification(
                R.drawable.exo_icon_play, null, null, downloads);
    }
}
