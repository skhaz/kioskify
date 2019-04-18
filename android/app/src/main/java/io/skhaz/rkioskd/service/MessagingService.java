package io.skhaz.rkioskd.service;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import io.skhaz.rkioskd.application.Application;
import io.skhaz.rkioskd.helper.DownloadTracker;

public class MessagingService extends FirebaseMessagingService {

    DownloadTracker downloadTracker;

    @Override
    public void onCreate() {
        super.onCreate();

        downloadTracker = ((Application) getApplication())
                .getDownloadTracker();
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();

        if (data == null || data.isEmpty()) {
            return;
        }

        String url = data.get("url");

        downloadTracker.initDownload(url);
    }
}
