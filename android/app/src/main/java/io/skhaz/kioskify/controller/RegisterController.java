package io.skhaz.kioskify.controller;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.common.base.Strings;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.ListenerRegistration;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import io.skhaz.kioskify.R;

public class RegisterController {

    public static final String MACHINE_PREFS = "MACHINE_ID";

    private Context context;

    private FirebaseFirestore firestore;

    private ListenerRegistration subscriber;

    private Task<DocumentReference> referenceTask;

    private TextView textView;

    public RegisterController(Context context) {
        this.context = context;
        firestore = FirebaseFirestore.getInstance();
    }

    public void init(TextView textView) {
        this.textView = textView;
        SharedPreferences sharedPreferences =
                PreferenceManager.getDefaultSharedPreferences(context);
        String machineId = sharedPreferences.getString(MACHINE_PREFS, null);
        boolean firstRun = Strings.isNullOrEmpty(machineId);

        if (firstRun) {
            Random random = new Random();
            String allowedCharacters = context.getString(R.string.allowed_characters);
            StringBuilder builder = new StringBuilder();

            for (int i = 0; i < 4; i++) {
                builder.append(allowedCharacters.charAt(
                        random.nextInt(allowedCharacters.length())));
            }

            String pinCode = builder.toString().toUpperCase();

            Map<String, Object> document = new HashMap<>();
            document.put("pinCode", pinCode);
            document.put("manufacture", Build.MANUFACTURER);
            document.put("brand", Build.BRAND);
            document.put("model", Build.MODEL);
            document.put("fingerprint", Build.FINGERPRINT);
            document.put("added", Calendar.getInstance().getTime());

            referenceTask = firestore
                    .collection("machines").add(document);

            referenceTask.addOnSuccessListener(new OnSuccessListener<DocumentReference>() {
                        @Override
                        public void onSuccess(DocumentReference documentReference) {
                            textView.setVisibility(View.VISIBLE);
                            textView.setText(pinCode);

                            SharedPreferences.Editor editor = sharedPreferences.edit();
                            String machineId = documentReference.getId();
                            editor.putString(MACHINE_PREFS, machineId);
                            editor.apply();
                            startToListen(machineId);
                        }
                    });

            referenceTask.addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(@NonNull Exception exception) {

                }
            });
        } else {
            startToListen(machineId);
        }
    }

    public void tearDown() {
        textView.setVisibility(View.GONE);

        if (subscriber != null) {
            subscriber.remove();
        }
    }

    private void startToListen(@NonNull String machineId) {
        if (subscriber != null) {
            subscriber.remove();
            subscriber = null;
        }

        subscriber = firestore.collection("machines")
                .document(machineId)
                .addSnapshotListener(new EventListener<DocumentSnapshot>() {
                    @Override
                    public void onEvent(
                            @Nullable DocumentSnapshot documentSnapshot,
                            @Nullable FirebaseFirestoreException exception) {
                        if (documentSnapshot == null) {
                            return;
                        }

                        String pinCode = documentSnapshot.getString("pinCode");

                        if (Strings.isNullOrEmpty(pinCode)) {
                            tearDown();

                            return;
                        }

                        textView.setVisibility(View.VISIBLE);
                        textView.setText(pinCode);
                    }
                });
    }
}
