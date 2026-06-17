package com.t7.seal.service.impl;

import com.t7.seal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationDispatchScheduler {

    private final NotificationService notificationService;

    @Scheduled(fixedDelayString = "${app.notification.dispatch-delay-ms:60000}")
    public void dispatchDueNotifications() {
        notificationService.dispatchDueNotifications();
    }
}
