package com.t7.seal.service;

public interface RoundDeadlineTransitionService {
    int transitionExpiredOpenRoundsToPendingLock();
}
