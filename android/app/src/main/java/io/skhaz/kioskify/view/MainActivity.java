package io.skhaz.kioskify.view;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager.LayoutParams;
import android.widget.TextView;

import com.google.android.exoplayer2.PlaybackPreparer;
import com.google.android.exoplayer2.ui.PlayerView;

import io.skhaz.kioskify.R;
import io.skhaz.kioskify.controller.PlayerController;
import io.skhaz.kioskify.helper.PairingAssistant;

public class MainActivity extends Activity implements PlaybackPreparer {

    private PlayerView playerView;

    private TextView textView;

    private PlayerController playerController;

    private PairingAssistant pairingAssistant;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.addFlags(LayoutParams.FLAG_KEEP_SCREEN_ON |
                LayoutParams.FLAG_DISMISS_KEYGUARD |
                LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                LayoutParams.FLAG_TURN_SCREEN_ON);
        setContentView(R.layout.main_activity);

        playerView = findViewById(R.id.player_view);
        playerView.requestFocus();
        playerView.setUseController(false);
        playerView.setPlaybackPreparer(this);
        textView = findViewById(R.id.text_view);
        playerController = new PlayerController(this);
        pairingAssistant = new PairingAssistant(this);
    }

    @Override
    protected void onStart() {
        super.onStart();

        playerController.init(playerView);
        pairingAssistant.init(textView);
    }

    @Override
    public void onStop() {
        super.onStop();

        playerController.tearDown();
        pairingAssistant.tearDown();
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

    @Override
    public void preparePlayback() {
        playerController.init(playerView);
    }
}