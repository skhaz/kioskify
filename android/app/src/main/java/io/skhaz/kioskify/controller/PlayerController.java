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
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.LoopingMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.TrackGroupArray;
import com.google.android.exoplayer2.trackselection.TrackSelectionArray;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.common.base.Strings;
import com.google.firebase.firestore.DocumentChange;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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

import static io.skhaz.kioskify.controller.RegisterController.MACHINE_PREFS;

public class PlayerController {

    private ListenerRegistration subscriber;

    private ListenerRegistration innerSubscriber;

    private OnSharedPreferenceChangeListener preferenceChangeListener;

    private Context context;

    private SimpleExoPlayer player;

    private FirebaseFirestore firestore;

    private DataSource.Factory dataSourceFactory;

    private DownloadTracker downloadTracker;

    private Map<Entry, Video> mediaSources = new TreeMap<>();

    private Timer debounce;

    SharedPreferences sharedPreferences;

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
        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public void init(PlayerView playerView) {
        initPlayer(playerView);
        // initFirebase();
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

                        DocumentReference groupId =
                                documentSnapshot.getDocumentReference("gid");

                        if (groupId == null) {
                            return;
                        }

                        if (innerSubscriber != null) {
                            innerSubscriber.remove();
                            innerSubscriber = null;
                        }

                        innerSubscriber = firestore.collection("v1")
                                .whereEqualTo("gid", groupId)
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

        downloadTracker.initDownload(video.url);

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
            // TODO
            // downloadTracker.removeDownload(
            //        video.guessFileName(), Uri.parse(video.url));
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
            public void run() {
                List<Map.Entry<Entry, Video>> entries
                        = new ArrayList<>(mediaSources.entrySet());

                Collections.sort(entries, new Comparator<Map.Entry<Entry, Video>>() {
                    public int compare(Map.Entry<Entry, Video> lhs, Map.Entry<Entry, Video> rhs) {
                        return Integer.compare(lhs.getKey().index, rhs.getKey().index);
                    }
                });

                List<MediaSource> sources = new ArrayList<>();

                for (Map.Entry<Entry, Video> entry : entries) {
                    Video video = entry.getValue();

                    if (video == null) {
                        continue;
                    }

                    String url = video.url;

                    if (Strings.isNullOrEmpty(url) || !URLUtil.isValidUrl(url)) {
                        continue;
                    }

                    sources.add(buildMediaSource(Uri.parse(url)));
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

    private DownloadTracker getDownloadTracker() {
        return ((Application) context.getApplicationContext())
                .getDownloadTracker();
    }

    private MediaSource buildMediaSource(@NonNull Uri uri) {
        return new ExtractorMediaSource.Factory(dataSourceFactory)
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
        public void onPlayerError(ExoPlaybackException e) {

        }

        @Override
        public void onTracksChanged(TrackGroupArray trackGroups, TrackSelectionArray trackSelections) {

        }
    }
}
