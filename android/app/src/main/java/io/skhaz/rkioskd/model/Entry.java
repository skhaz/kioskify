package io.skhaz.rkioskd.model;

import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.PropertyName;

public class Entry extends BaseModel {

    @PropertyName("#")
    public int index;

    @PropertyName("vid")
    public DocumentReference videoRef;

    @PropertyName("gid")
    public DocumentReference groupRef;
}
