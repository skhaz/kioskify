package io.skhaz.kioskify.model;

import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.PropertyName;

public class Entry extends BaseModel {

    @PropertyName("#")
    public int index;

    @PropertyName("video")
    public DocumentReference videoRef;

    // @PropertyName("group")
    // public DocumentReference groupRef;
}
