package io.skhaz.kioskify.view;

import android.app.Activity;
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
import com.google.android.exoplayer2.util.Log;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
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

        boolean firstRun = true;

        if (firstRun) {
            Random random = new Random();
            StringBuilder builder = new StringBuilder();
            String allowedCharacters = getString(R.string.allowed_characters);
            for (int i = 0; i < 4; i++) {
                builder.append(allowedCharacters.charAt(random.nextInt(allowedCharacters.length())));
            }

            TextView textView = findViewById(R.id.text_view);
            textView.setVisibility(View.VISIBLE);
            textView.setText(builder.toString().toUpperCase());
        }

        playerView = findViewById(R.id.player_view);
        playerView.requestFocus();
        playerView.setUseController(false);
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