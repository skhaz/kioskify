package io.skhaz.kioskify.controller;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.exoplayer2.util.Log;
import com.google.android.gms.tasks.OnCompleteListener;
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
import com.google.firebase.firestore.SnapshotMetadata;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import io.skhaz.kioskify.R;

public class RegisterController {

    public static final String MACHINE_PREFS = "MACHINE_ID";

    public static final String PINCODE_PREFS = "PIN_CODE";

    private Context context;

    private FirebaseFirestore firestore;

    private ListenerRegistration subscriber;

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

        if (Strings.isNullOrEmpty(machineId)) {
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

            DocumentReference reference = firestore.collection("machines").document();

            machineId = reference.getId();

            sharedPreferences.edit().putString(MACHINE_PREFS, machineId)
                    .apply();

            reference.set(document).addOnSuccessListener(new OnSuccessListener<Void>() {

                @Override
                public void onSuccess(Void aVoid) {
                    textView.setVisibility(View.VISIBLE);
                    textView.setText(pinCode);
                }
            });

            sharedPreferences.edit().putString(PINCODE_PREFS, pinCode)
                    .apply();

            textView.setVisibility(View.VISIBLE);
            textView.setText(
                    context.getString(R.string.synchronizing));
        }

        subscribeToChanges(machineId);
    }

    public void tearDown() {
        if (subscriber != null) {
            subscriber.remove();
        }
    }

    private void subscribeToChanges(@NonNull String machineId) {
        if (subscriber != null) {
            subscriber.remove();
            subscriber = null;
        }

        subscriber = firestore.collection("machines")
                .document(machineId)
                .addSnapshotListener(new EventListener<DocumentSnapshot>() {
                    @Override
                    public void onEvent(@Nullable DocumentSnapshot documentSnapshot,
                                        @Nullable FirebaseFirestoreException exception) {
                        if (exception != null || documentSnapshot == null) {
                            return;
                        }

                        String pinCode = documentSnapshot.getString("pinCode");

                        boolean invalidPinCode = Strings.isNullOrEmpty(pinCode);

                        /*
                        SnapshotMetadata metadata = documentSnapshot.getMetadata();

                        if (metadata.hasPendingWrites()) {
                            if (!invalidPinCode) {
                                textView.setVisibility(View.VISIBLE);
                                textView.setText(
                                        context.getString(R.string.synchronizing));
                            }

                            return;
                        }
                        */

                        if (invalidPinCode) {
                            textView.setText(null);
                            textView.setVisibility(View.GONE);

                            return;
                        }

                        textView.setVisibility(View.VISIBLE);
                        textView.setText(pinCode);
                    }
                });
    }
}
