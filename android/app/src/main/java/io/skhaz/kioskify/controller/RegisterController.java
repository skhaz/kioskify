package io.skhaz.kioskify.controller;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.google.android.exoplayer2.util.Log;
import com.google.android.gms.tasks.OnSuccessListener;
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

    private Context context;

    private FirebaseFirestore firestore;

    private SharedPreferences prefs;

    private ListenerRegistration listener;

    public RegisterController(Context context) {
        this.context = context;
        firestore = FirebaseFirestore.getInstance();
        prefs = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public void init(TextView textView) {
        final String machineId = prefs.getString("machine_id", null);
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
            document.put("Manufacture", Build.MANUFACTURER);
            document.put("Brand", Build.BRAND);
            document.put("Model", Build.MODEL);
            document.put("Serial", Build.SERIAL);
            document.put("Fingerprint", Build.FINGERPRINT);
            document.put("added", Calendar.getInstance().getTime());
            firestore.collection("machines").add(document)
                    .addOnSuccessListener(new OnSuccessListener<DocumentReference>() {
                        @Override
                        public void onSuccess(DocumentReference documentReference) {
                            SharedPreferences.Editor editor = prefs.edit();
                            editor.putString("machine_id", documentReference.getId());
                            editor.apply();

                            textView.setVisibility(View.VISIBLE);
                            textView.setText(pinCode);
                        }
                    });

        } else {
            listener = firestore.collection("machines").document(machineId)
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
                                textView.setVisibility(View.GONE);

                                return;
                            }

                            textView.setVisibility(View.VISIBLE);
                            textView.setText(pinCode);
                        }
                    });
        }
    }

    public void tearDown() {
        if (listener != null) {
            listener.remove();
        }
    }
}
