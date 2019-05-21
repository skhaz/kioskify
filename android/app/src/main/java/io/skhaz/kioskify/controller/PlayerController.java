package io.skhaz.kioskify.controller;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.OnSharedPreferenceChangeListener;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.preference.PreferenceManager;
import android.webkit.URLUtil;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.Player.DiscontinuityReason;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.source.ConcatenatingMediaSource;
import com.google.android.exoplayer2.source.LoopingMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.ProgressiveMediaSource;
import com.google.android.exoplayer2.source.TrackGroupArray;
import com.google.android.exoplayer2.trackselection.TrackSelectionArray;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.common.base.Strings;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Timer;
import java.util.TimerTask;
import java.util.TreeMap;

import io.skhaz.kioskify.application.Application;
import io.skhaz.kioskify.helper.DownloadTracker;
import io.skhaz.kioskify.model.Entry;
import io.skhaz.kioskify.model.Video;

import static io.skhaz.kioskify.helper.PairingAssistant.MACHINE_PREFS;

public class PlayerController {

    private final Map<Entry, Video> mediaSources = new TreeMap<>();

    private final List<Video> playlist = new ArrayList<>();

    private SharedPreferences sharedPreferences;

    private ListenerRegistration subscriber;

    private ListenerRegistration innerSubscriber;

    private OnSharedPreferenceChangeListener preferenceChangeListener;

    private Context context;

    private SimpleExoPlayer player;

    private FirebaseFirestore firestore;

    private FirebaseMessaging messaging;

    private DataSource.Factory dataSourceFactory;

    private DownloadTracker downloadTracker;

    private Timer debounce;

    EventListener<QuerySnapshot> onSnapshot = new EventListener<QuerySnapshot>() {
        @Override
        public void onEvent(@Nullable QuerySnapshot snapshots,
                            @Nullable FirebaseFirestoreException exception) {
            if (exception != null || snapshots == null) {
                return;
            }

            for (DocumentChange change : snapshots.getDocumentChanges()) {
                QueryDocumentSnapshot doc = change.getDocument();
                Entry entry = doc.toObject(Entry.class)
                        .withId(doc.getId());
                OnCompleteListener<DocumentSnapshot> onComplete
                        = new OnCompleteListener<DocumentSnapshot>() {
                    @Override
                    public void onComplete(@NonNull Task<DocumentSnapshot> task) {
                        DocumentSnapshot snapshot = task.getResult();

                        if (snapshot == null || !snapshot.exists()) {
                            return;
                        }

                        Video video = snapshot.toObject(Video.class);

                        if (video == null) {
                            return;
                        }

                        video.withId(snapshot.getId());

                        DocumentChange.Type type = change.getType();
                        if (type == DocumentChange.Type.ADDED ||
                                type == DocumentChange.Type.MODIFIED) {
                            if (!video.isValid()) {
                                return;
                            }

                            addEntry(entry, video);
                        } else if (type == DocumentChange.Type.REMOVED) {
                            removeEntry(entry, video);
                        }
                    }
                };

                DocumentReference documentReference = entry.videoRef;

                if (documentReference != null) {
                    documentReference.get()
                            .addOnCompleteListener(onComplete);
                }
            }
        }
    };

    public PlayerController(Context context) {
        this.context = context;
        dataSourceFactory = buildDataSourceFactory();
        downloadTracker = getDownloadTracker();
        firestore = FirebaseFirestore.getInstance();
        messaging = FirebaseMessaging.getInstance();
        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public void init(PlayerView playerView) {
        initPlayer(playerView);
        initSharedPreferences();
    }

    private void initPlayer(PlayerView playerView) {
        if (player != null) {
            return;
        }

        player = ExoPlayerFactory.newSimpleInstance(context);
        player.addListener(new PlayerEventListener());
        player.setVolume(0f);
        player.setPlayWhenReady(true);
        playerView.setPlayer(player);
    }

    private void initFirebase(@NonNull String id) {
        if (subscriber != null) {
            subscriber.remove();
            subscriber = null;
        }

        subscriber = firestore
                .collection("machines")
                .document(id)
                .addSnapshotListener(new EventListener<DocumentSnapshot>() {
                    @Override
                    public void onEvent(@Nullable DocumentSnapshot documentSnapshot,
                                        @Nullable FirebaseFirestoreException exception) {
                        if (exception != null || documentSnapshot == null) {
                            return;
                        }

                        synchronized (mediaSources) {
                            if (!mediaSources.isEmpty()) {
                                mediaSources.clear();

                                buildPlaylist();
                            }
                        }

                        if (innerSubscriber != null) {
                            innerSubscriber.remove();
                            innerSubscriber = null;
                        }

                        DocumentReference groupRef =
                                documentSnapshot.getDocumentReference("group");

                        if (groupRef == null) {
                            return;
                        }

                        List<Task<Void>> tasks = new ArrayList<>();

                        Task<Void> subscribeTask = messaging.subscribeToTopic(groupRef.getId());

                        tasks.add(subscribeTask);

                        DocumentReference unsubscribe =
                                documentSnapshot.getDocumentReference("unsubscribe");

                        if (unsubscribe != null) {
                            String id = unsubscribe.getId();
                            if (!Strings.isNullOrEmpty(id)) {
                                Task<Void> unsubscribeTask = messaging.unsubscribeFromTopic(id);
                                tasks.add(unsubscribeTask);
                            }
                        }

                        Tasks.whenAll(tasks).addOnCompleteListener(new OnCompleteListener<Void>() {
                            @Override
                            public void onComplete(@NonNull Task<Void> task) {
                                // ...
                            }
                        });

                        innerSubscriber = firestore.collection("v1")
                                .whereEqualTo("group", groupRef)
                                .addSnapshotListener(onSnapshot);
                    }
                });
    }

    private void initSharedPreferences() {
        String machineId = sharedPreferences
                .getString(MACHINE_PREFS, null);

        if (Strings.isNullOrEmpty(machineId)) {
            if (preferenceChangeListener != null) {
                sharedPreferences.unregisterOnSharedPreferenceChangeListener(preferenceChangeListener);
                preferenceChangeListener = null;
            }

            preferenceChangeListener = new OnSharedPreferenceChangeListener() {
                @Override
                public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
                    if (MACHINE_PREFS.equals(key)) {
                        String machineId = sharedPreferences.getString(MACHINE_PREFS, null);

                        if (Strings.isNullOrEmpty(machineId)) {
                            return;
                        }

                        initFirebase(machineId);
                    }
                }
            };

            sharedPreferences.registerOnSharedPreferenceChangeListener(preferenceChangeListener);
        } else {
            initFirebase(machineId);
        }
    }

    public void tearDown() {
        if (player != null) {
            player.release();
            player = null;
        }

        if (preferenceChangeListener != null) {
            sharedPreferences.unregisterOnSharedPreferenceChangeListener(preferenceChangeListener);
            preferenceChangeListener = null;
        }

        if (subscriber != null) {
            subscriber.remove();
            subscriber = null;
        }

        if (innerSubscriber != null) {
            innerSubscriber.remove();
            innerSubscriber = null;
        }
    }

    private void addEntry(@NonNull Entry entry,
                          @NonNull Video video) {
        mediaSources.remove(entry);

        mediaSources.put(entry, video);

        downloadTracker.addDownload(video.url);

        buildPlaylist();
    }

    private void removeEntry(@NonNull Entry entry,
                             @NonNull Video video) {
        Video otherVideo = mediaSources.get(entry);

        if (otherVideo == null || !Objects.equals(video, otherVideo)) {
            return;
        }

        mediaSources.remove(entry);

        boolean preserve = mediaSources.values()
                .contains(otherVideo);

        if (!preserve) {
            downloadTracker.removeDownload(video.url);
        }

        buildPlaylist();
    }

    private void buildPlaylist() {
        if (player == null) {
            return;
        }

        if (debounce != null) {
            debounce.cancel();
            debounce = null;
        }

        debounce = new Timer();

        debounce.schedule(new TimerTask() {
            public synchronized void run() {
                List<Map.Entry<Entry, Video>> entries
                        = new ArrayList<>(mediaSources.entrySet());

                Collections.sort(entries, new Comparator<Map.Entry<Entry, Video>>() {
                    public int compare(Map.Entry<Entry, Video> lhs, Map.Entry<Entry, Video> rhs) {
                        return Integer.compare(lhs.getKey().index, rhs.getKey().index);
                    }
                });

                synchronized (playlist) {
                    playlist.clear();

                    for (Map.Entry<Entry, Video> entry : entries) {
                        Video video = entry.getValue();

                        if (video == null) {
                            continue;
                        }

                        String url = video.url;

                        if (Strings.isNullOrEmpty(url) || !URLUtil.isValidUrl(url)) {
                            continue;
                        }

                        playlist.add(video);
                    }
                }

                List<MediaSource> sources = new ArrayList<>();

                for (Video video : playlist) {
                    sources.add(buildMediaSource(Uri.parse(video.url)));
                }

                final MediaSource mediaSource =
                        new ConcatenatingMediaSource(sources.toArray(new MediaSource[sources.size()]));

                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        player.prepare(new LoopingMediaSource(mediaSource));
                    }
                });
            }
        }, 1000);

    }

    private @Nullable String getCurrentPlayingVideoId() {
        if (player == null || playlist.isEmpty()) {
            return null;
        }

        int windowIndex = player.getCurrentWindowIndex();

        if (windowIndex < 0 || windowIndex > playlist.size()) {
            return null;
        }

        return playlist.get(windowIndex).id;
    }

    private DownloadTracker getDownloadTracker() {
        return ((Application) context.getApplicationContext())
                .getDownloadTracker();
    }

    private MediaSource buildMediaSource(@NonNull Uri uri) {
        return new ProgressiveMediaSource.Factory(dataSourceFactory)
                .createMediaSource(uri);
    }

    private DataSource.Factory buildDataSourceFactory() {
        return ((Application) context.getApplicationContext())
                .buildDataSourceFactory();
    }

    private class PlayerEventListener implements Player.EventListener {

        @Override
        public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {

        }

        @Override
        public void onPositionDiscontinuity(@DiscontinuityReason int reason) {

        }

        @Override
        public void onPlayerError(ExoPlaybackException error) {
            if (error.type == ExoPlaybackException.TYPE_SOURCE) {
                String videoId = getCurrentPlayingVideoId();

                if (videoId == null) {
                    return;
                }

                Iterator<Map.Entry<Entry, Video>> iterator =
                        mediaSources.entrySet().iterator();

                while (iterator.hasNext()) {
                    Map.Entry<Entry, Video> entry = iterator.next();

                    if (videoId.equals(entry.getValue().id)) {
                        iterator.remove();
                    }
                }

                buildPlaylist();
            }
        }

        @Override
        public void onTracksChanged(TrackGroupArray trackGroups, TrackSelectionArray trackSelections) {
            String videoId = getCurrentPlayingVideoId();

            if (videoId == null) {
                return;
            }

            DocumentReference videoRef = firestore.collection("videos").document(videoId);

            videoRef.update("playbackCounter", FieldValue.increment(1))
                    .addOnCompleteListener(new OnCompleteListener<Void>() {
                        @Override
                        public void onComplete(@NonNull Task<Void> task) {
                            // ...
                        }
                    });
        }
    }
}
