package io.skhaz.kioskify.model;

import android.webkit.URLUtil;

public class Video extends BaseModel {

    public String url;

    public Boolean error;

    public boolean isValid() {
        return URLUtil.isValidUrl(url) && (error == null || !error);
    }
}
