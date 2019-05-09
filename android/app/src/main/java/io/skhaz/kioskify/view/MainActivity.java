package io.skhaz.kioskify.view;

import android.app.Activity;
import android.content.Intent;
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
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import io.skhaz.kioskify.R;
import io.skhaz.kioskify.controller.PlayerController;
import io.skhaz.kioskify.controller.RegisterController;

public class MainActivity extends Activity implements PlaybackPreparer, View.OnClickListener {

    private PlayerView playerView;

    private TextView textView;

    private PlayerController playerController;

    private RegisterController registerController;

    private GoogleSignInClient googleSignInClient;

    private static final int RC_SIGN_IN = 9001;

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
        // playerView.setUseController(false);
        playerView.setPlaybackPreparer(this);
        textView = findViewById(R.id.text_view);
        playerController = new PlayerController(this);
        registerController = new RegisterController(this);

        FirebaseMessaging.getInstance().subscribeToTopic("/topics/y0mFxOO9CSGzHHiMypPs")
                .addOnCompleteListener(new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        String msg = "subscribed";
                        if (!task.isSuccessful()) {
                            msg = "subscribe_failed";
                        }
                        // Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
                    }
                });

        findViewById(R.id.sign_in_button).setOnClickListener(this);

        GoogleSignInOptions googleSignInOptions =
                new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestIdToken(getString(R.string.default_web_client_id))
                        .requestEmail()
                        .build();

        googleSignInClient = GoogleSignIn.getClient(this, googleSignInOptions);
    }

    @Override
    protected void onStart() {
        super.onStart();

        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        // Log.d(">>>", account.toString());


        playerController.init(playerView);
        registerController.init(textView);

        int i = playerView.getPlayer().getPlaybackState();

        Log.d(">>>", String.valueOf(i));

    }

    @Override
    public void onStop() {
        super.onStop();

        playerController.tearDown();
        registerController.tearDown();
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

    // @Override
    // public boolean onKeyDown(int keyCode, KeyEvent event) {
    //     return true;
    // }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> completedTask = GoogleSignIn.getSignedInAccountFromIntent(data);

            try {
                GoogleSignInAccount account = completedTask.getResult(ApiException.class);

                // Signed in successfully, show authenticated UI.
                Toast.makeText(this, String.valueOf(account), Toast.LENGTH_LONG).show();
            } catch (ApiException e) {
                // The ApiException status code indicates the detailed failure reason.
                // Please refer to the GoogleSignInStatusCodes class reference for more information.
            }

        }
    }

    @Override
    public void preparePlayback() {
        Log.d(">>>", "preparePlayback");
        playerController.init(playerView);
    }

    @Override
    public void onClick(View view) {
        if (view.getId() == R.id.sign_in_button) {
            startActivityForResult(
                    googleSignInClient.getSignInIntent(), RC_SIGN_IN);
        }
    }
}