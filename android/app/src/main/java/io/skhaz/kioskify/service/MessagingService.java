package io.skhaz.kioskify.service;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import io.skhaz.kioskify.application.Application;
import io.skhaz.kioskify.helper.DownloadTracker;

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

        downloadTracker.addDownload(url);
    }
}
