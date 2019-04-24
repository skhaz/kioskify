package io.skhaz.kioskify.view;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager.LayoutParams;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.google.android.exoplayer2.PlaybackPreparer;
import com.google.android.exoplayer2.ui.PlayerView;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.common.base.Strings;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.Random;

import io.skhaz.kioskify.R;
import io.skhaz.kioskify.controller.PlayerController;

public class MainActivity extends Activity implements PlaybackPreparer {

    private PlayerView playerView;

    private PlayerController playerController;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.addFlags(LayoutParams.FLAG_KEEP_SCREEN_ON |
                LayoutParams.FLAG_DISMISS_KEYGUARD |
                LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                LayoutParams.FLAG_TURN_SCREEN_ON);
        setContentView(R.layout.main_activity);

        // boolean firstRun = true;
        // SharedPreferences.Editor editor = getPreferences(MODE_PRIVATE).edit();
        // SharedPreferences prefs = getPreferences(MODE_PRIVATE);
        // boolean firstRun = prefs.getBoolean("firstRun", true);

        SharedPreferences prefs = getPreferences(MODE_PRIVATE);
        String machineId = prefs.getString("machine", null);
        boolean firstRun = Strings.isNullOrEmpty(machineId);

        if (firstRun) {
            Random random = new Random();
            String allowedCharacters = getString(R.string.allowed_characters);
            StringBuilder builder = new StringBuilder();

            for (int i = 0; i < 4; i++) {
                builder.append(allowedCharacters.charAt(
                        random.nextInt(allowedCharacters.length())));
            }

            String secret = builder.toString().toUpperCase();

            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("machine", id);
            editor.apply();

            // Store secret on firestore, get the Id and save on sharedPreferences

            TextView textView = findViewById(R.id.text_view);
            textView.setVisibility(View.VISIBLE);
            textView.setText(secret);
        }

        playerView = findViewById(R.id.player_view);
        playerView.requestFocus();
        // playerView.setUseController(false);
        playerView.setPlaybackPreparer(this);
        playerController = new PlayerController(this);

        FirebaseMessaging.getInstance().subscribeToTopic("/topics/y0mFxOO9CSGzHHiMypPs")
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        String msg = "subscribed";
                        if (!task.isSuccessful()) {
                            msg = "subscribe_failed";
                        }
                        Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    @Override
    protected void onStart() {
        super.onStart();

        playerController.init(playerView);
    }

    @Override
    public void onStop() {
        super.onStop();

        playerController.tearDown();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        View decorView = getWindow().getDecorView();
        decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        return playerView.dispatchKeyEvent(event) || super.dispatchKeyEvent(event);
    }

    //@Override
    //public boolean onKeyDown(int keyCode, KeyEvent event) {
    //    return true;
    //}

    @Override
    public void preparePlayback() {
        playerController.init(playerView);
    }
}