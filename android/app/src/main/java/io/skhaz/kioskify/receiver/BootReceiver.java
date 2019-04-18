package io.skhaz.kioskify.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import io.skhaz.kioskify.service.WakeUpService;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent != null && Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            WakeUpService.enqueueWork(context, new Intent());
        }
    }
}
