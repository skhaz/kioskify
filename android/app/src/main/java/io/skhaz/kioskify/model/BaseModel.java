package io.skhaz.kioskify.model;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.firebase.firestore.Exclude;
import com.google.firebase.firestore.IgnoreExtraProperties;

@IgnoreExtraProperties
public class BaseModel implements Comparable<BaseModel> {

    @Exclude
    public String id;

    @NonNull
    @SuppressWarnings("unchecked")
    public <T extends BaseModel> T withId(@NonNull final String id) {
        this.id = id;
        return (T) this;
    }

    @Override
    public boolean equals(@Nullable Object other) {
        if (other == null || other.getClass() != getClass()) {
            return false;
        }

        BaseModel otherModel = (BaseModel) other;

        return id.equals(otherModel.id);
    }

    @Override
    public int compareTo(BaseModel other) {
        return id.compareTo(other.id);
    }
}