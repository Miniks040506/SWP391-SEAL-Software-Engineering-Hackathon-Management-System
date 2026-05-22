package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/rankings")
public class RankingController {
}
