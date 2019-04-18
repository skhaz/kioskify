package io.skhaz.kioskify.helper;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.HandlerThread;
import android.webkit.MimeTypeMap;
import android.webkit.URLUtil;

import com.google.android.exoplayer2.offline.ActionFile;
import com.google.android.exoplayer2.offline.DownloadAction;
import com.google.android.exoplayer2.offline.DownloadHelper;
import com.google.android.exoplayer2.offline.DownloadManager;
import com.google.android.exoplayer2.offline.DownloadManager.TaskState;
import com.google.android.exoplayer2.offline.ProgressiveDownloadHelper;
import com.google.android.exoplayer2.util.Log;
import com.google.android.exoplayer2.util.Util;
import com.google.common.base.Strings;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import io.skhaz.kioskify.service.DownloadService;

public class DownloadTracker implements DownloadManager.Listener {

    private static final String TAG = "DownloadTracker";

    private final Context context;

    private final CopyOnWriteArraySet<Listener> listeners;

    private final HashMap<Uri, DownloadAction> trackedStates;

    private final ActionFile actionFile;

    private final Handler fileWriteHandler;

    public DownloadTracker(
            Context context,
            File actionFile,
            DownloadAction.Deserializer... deserializers) {
        this.context = context.getApplicationContext();
        this.actionFile = new ActionFile(actionFile);
        listeners = new CopyOnWriteArraySet<>();
        trackedStates = new HashMap<>();
        HandlerThread handlerThread = new HandlerThread("DownloadTracker");
        handlerThread.start();
        fileWriteHandler = new Handler(handlerThread.getLooper());

        loadTrackedActions(
                deserializers.length > 0 ? deserializers : DownloadAction.getDefaultDeserializers());
    }

    @Override
    public void onInitialized(DownloadManager downloadManager) {

    }

    @Override
    public void onTaskStateChanged(DownloadManager downloadManager, TaskState taskState) {
        DownloadAction action = taskState.action;

        Uri uri = action.uri;

        if ((action.isRemoveAction && taskState.state == TaskState.STATE_COMPLETED)
                || (!action.isRemoveAction && taskState.state == TaskState.STATE_FAILED)) {
            if (trackedStates.remove(uri) != null) {
                handleTrackedDownloadStatesChanged();
            }
        }
    }

    @Override
    public void onIdle(DownloadManager downloadManager) {

    }

    public void addListener(Listener listener) {
        listeners.add(listener);
    }

    public void removeListener(Listener listener) {
        listeners.remove(listener);
    }

    public boolean isDownloaded(Uri uri) {
        return trackedStates.containsKey(uri);
    }

    private void startDownload(DownloadAction action) {
        if (isDownloaded(action.uri)) {
            return;
        }

        trackedStates.put(action.uri, action);
        handleTrackedDownloadStatesChanged();
        startServiceWithAction(action);
    }

    public void removeDownload(String name, Uri uri) {
        if (isDownloaded(uri)) {
            DownloadAction removeAction =
                    getDownloadHelper(uri).getRemoveAction(Util.getUtf8Bytes(name));

            startServiceWithAction(removeAction);
        }
    }

    private void startServiceWithAction(DownloadAction action) {
        com.google.android.exoplayer2.offline.DownloadService.startWithAction(context, DownloadService.class, action, false);
    }

    private DownloadHelper getDownloadHelper(Uri uri) {
        return new ProgressiveDownloadHelper(uri);
    }

    public void initDownload(String url) {
        if (Strings.isNullOrEmpty(url) || !URLUtil.isValidUrl(url)) {
            return;
        }

        String name = URLUtil.guessFileName(url, null, MimeTypeMap.getFileExtensionFromUrl(url));
        Uri uri = Uri.parse(url);
        DownloadHelper downloadHelper = getDownloadHelper(uri);
        DownloadAction downloadAction =
                downloadHelper.getDownloadAction(Util.getUtf8Bytes(name), null);

        startDownload(downloadAction);
    }

    private void loadTrackedActions(DownloadAction.Deserializer[] deserializers) {
        try {
            DownloadAction[] allActions = actionFile.load(deserializers);
            for (DownloadAction action : allActions) {
                trackedStates.put(action.uri, action);
            }
        } catch (IOException e) {
            Log.e(TAG, "failed to load tracked actions", e);
        }
    }

    private void handleTrackedDownloadStatesChanged() {
        for (Listener listener : listeners) {
            listener.onDownloadsChanged();
        }

        final DownloadAction[] actions = trackedStates.values().toArray(new DownloadAction[0]);
        fileWriteHandler.post(new Runnable() {
            @Override
            public void run() {
                try {
                    actionFile.store(actions);
                } catch (IOException e) {
                    Log.e(TAG, "failed to store tracked actions", e);
                }
            }
        });
    }

    public interface Listener {

        void onDownloadsChanged();
    }
}