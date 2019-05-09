package io.skhaz.kioskify.controller;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.lifecycle.MutableLiveData;

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

public class RegisterController implements EventListener<DocumentSnapshot> {

    private Context context;

    private FirebaseFirestore firestore;

    private SharedPreferences prefs;

    private ListenerRegistration listener;

    private TextView textView;

    public RegisterController(Context context) {
        this.context = context;
        firestore = FirebaseFirestore.getInstance();
        prefs = PreferenceManager.getDefaultSharedPreferences(context);
    }

    public void init(TextView textView) {
        this.textView = textView;
        final String machineId = prefs.getString("machine_id", null);
        boolean firstRun = Strings.isNullOrEmpty(machineId);


        MutableLiveData v = new MutableLiveData();
        v.postValue("a");

        // move to the same player controler?

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
            firestore.collection("machines").document(machineId)
                    .addSnapshotListener(this);
        }
    }

    public void tearDown() {
        if (listener != null) {
            listener.remove();
        }
    }

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
}
