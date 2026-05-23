package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.results.DisqualificationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/disqualifications")
public class DisqualificationController {
    @PostMapping
    public ResponseEntity<DisqualificationResponse> disqualifySubmission(
            @Valid @RequestBody CreateDisqualificationRequest request
    ) {
        return null;
    }

    @GetMapping("/{disqualificationId}")
    public ResponseEntity<DisqualificationResponse> getDisqualificationById(
            @PathVariable("disqualificationId") UUID disqualificationId
    ) {
        return null;
    }

    @PatchMapping("/{disqualificationId}/appeal")
    public ResponseEntity<DisqualificationResponse> updateAppeal(
            @PathVariable("disqualificationId") UUID disqualificationId,
            @Valid @RequestBody UpdateAppealRequest request
    ) {
        return null;
    }

    @PostMapping("/{disqualificationId}/overturn")
    public ResponseEntity<DisqualificationResponse> overturnDisqualification(
            @PathVariable("disqualificationId") UUID disqualificationId,
            @Valid @RequestBody OverturnDisqualificationRequest request
    ) {
        return null;
    }
}
