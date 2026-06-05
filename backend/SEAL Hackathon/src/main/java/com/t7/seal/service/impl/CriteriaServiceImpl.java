package com.t7.seal.service.impl;

import com.t7.seal.domain.CriteriaCategory;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.entities.EventCriteria;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.ScoringCriteria;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.*;
import com.t7.seal.request.criteria.CreateEventCriteriaRequest;
import com.t7.seal.request.criteria.CreateScoringCriteriaRequest;
import com.t7.seal.request.criteria.UpdateEventCriteriaRequest;
import com.t7.seal.request.criteria.UpdateScoringCriteriaRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.criteria.ScoringCriteriaResponse;
import com.t7.seal.service.CriteriaService;
import com.t7.seal.service.CurrentUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.SortArgumentResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriteriaServiceImpl implements CriteriaService {

    public static final int MAX_PAGE_SIZE = 100;

    private final ScoringCriteriaRepository scoringCriteriaRepository;
    private final ScoreRepository scoreRepository;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;


    private final CurrentUserService currentUserService;
    private final SortArgumentResolver sortArgumentResolver;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<ScoringCriteriaResponse> getScoringCriteria(
            Boolean isActive,
            Boolean isTechnical,
            String category,
            int page,
            int size
    ) {

        CriteriaCategory parsedCategory = parseCategoryOrNull(category);

        int safePage = Math.max(page, 0);

        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        //filter criteria instead of filter it under repo
        Specification<ScoringCriteria> specs = (root, query, cb)
                -> {
            List<Predicate> predicates = new ArrayList<>();

            if (isActive != null) {
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            if (isTechnical != null) {
                predicates.add(cb.equal(root.get("isTechnical"), isTechnical));
            }

            if (parsedCategory != null) {
                predicates.add(cb.equal(root.get("category"), parsedCategory));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ScoringCriteria> criteriaPage = scoringCriteriaRepository
                .findAll(
                        specs,
                        PageRequest.of(safePage, safeSize, Sort.by(
                                Sort.Order.asc("category"),
                                Sort.Order.asc("name")
                        ))
                );

        List<ScoringCriteriaResponse> content = criteriaPage
                .getContent()
                .stream()
                .map(this::toScoringCriteriaResponse)
                .toList();

        return new PageResponse<>(
                content,
                criteriaPage.getNumber(),
                criteriaPage.getSize(),
                criteriaPage.getTotalElements(),
                criteriaPage.getTotalPages(),
                criteriaPage.isLast()
        );
    }

    @Transactional
    @Override
    public ScoringCriteriaResponse createScoringCriteria(CreateScoringCriteriaRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        validateCreateScoringCriteriaRequest(request);

        CriteriaCategory category = parseCategory(request.category());

        String name = category.name().trim();

        if (scoringCriteriaRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Criteria with this name already exists");
        }

        ScoringCriteria criteria = new ScoringCriteria();
        criteria.setName(name);
        criteria.setDescription(trimToNull(request.description()));
        criteria.setRubric(trimToNull(request.rubric()));
        criteria.setMaxScore(toFloat(request.maxScore(), "maxScore"));
        criteria.setDefaultWeight(toFloat(request.defaultWeight(), "defaultWeight"));
        criteria.setCategory(category);
        criteria.setIsTechnical(request.isTechnical() == null ? defaultTechnicalFlag(category) : request.isTechnical());
        criteria.setIsDefault(request.isDefault() == null || request.isDefault());
        criteria.setIsActive(true);

        return toScoringCriteriaResponse(scoringCriteriaRepository.save(criteria));
    }

    @Transactional(readOnly = true)
    @Override
    public ScoringCriteriaResponse getScoringCriteriaById(UUID criteriaId) {
        return toScoringCriteriaResponse(
                findScoringCriteria(criteriaId)
        );
    }

    @Transactional
    @Override
    public ScoringCriteriaResponse updateScoringCriteria(
            UUID criteriaId,
            UpdateScoringCriteriaRequest request,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        ScoringCriteria criteria = findScoringCriteria(criteriaId);

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Scoring Criteria name is required");
            }

            String newName = request.name().trim();

            if (!newName.equalsIgnoreCase(criteria.getName())
                    && scoringCriteriaRepository.existsByNameIgnoreCase(newName)) {
                throw new ConflictException("Criteria with this name already exists");
            }

            criteria.setName(newName);
        }

        if (request.description() != null) {
            criteria.setDescription(trimToNull(request.description()));
        }

        if (request.rubric() != null) {
            criteria.setRubric(trimToNull(request.rubric()));
        }

        if (request.maxScore() != null) {
            criteria.setMaxScore(toFloat(request.maxScore(), "maxScore"));
        }

        if (request.defaultWeight() != null) {
            criteria.setDefaultWeight(toFloat(request.defaultWeight(), "defaultWeight"));
        }

        if (request.category() != null || !request.category().isBlank()) {
            criteria.setCategory(parseCategory(request.category()));
        }

        if (request.isTechnical() != null) {
            criteria.setIsTechnical(request.isTechnical());
        }

        if (request.isDefault() != null) {
            criteria.setIsDefault(request.isDefault());
        }

        if (request.isActive() != null) {
            criteria.setIsActive(request.isActive());
        }

        return toScoringCriteriaResponse(scoringCriteriaRepository.save(criteria));
    }

    @Transactional
    @Override
    public ScoringCriteriaResponse deactivateScoringCriteria(UUID criteriaId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        ScoringCriteria criteria = findScoringCriteria(criteriaId);

        criteria.deactivate();

        return toScoringCriteriaResponse(scoringCriteriaRepository.save(criteria));
    }

    @Transactional
    @Override
    public ScoringCriteriaResponse activateScoringCriteria(UUID criteriaId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        ScoringCriteria criteria = findScoringCriteria(criteriaId);

        criteria.activate();

        return toScoringCriteriaResponse(scoringCriteriaRepository.save(criteria));
    }

    @Transactional
    @Override
    public void deleteScoringCriteria(UUID criteriaId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        ScoringCriteria criteria = findScoringCriteria(criteriaId);

        long usageCount = eventCriteriaRepository.countByCriteriaId(criteriaId);

        if (usageCount > 0) {
            criteria.deactivate();
            scoringCriteriaRepository.save(criteria);
            return;
        }

        scoringCriteriaRepository.delete(criteria);
    }

    @Transactional(readOnly = true)
    @Override
    public List<EventCriteriaResponse> getEventCriteria(UUID eventId, Boolean isActive, Boolean isTechnical) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required");
        }

        if (!hackathonEventRepository.existsById(eventId)) {
            throw new NotFoundException("Event not found");
        }


        return eventCriteriaRepository.findByEventIdOrderByDisplayOrderAsc(eventId)
                .stream().filter(cr -> isActive == null
                        || Boolean.TRUE.equals(cr.getIsActive()) == isActive)
                .filter(cr -> isTechnical == null || Boolean.TRUE.equals(cr.getEffectiveIsTechnical()))
                .map(this::toEventCriteriaResponse)
                .toList();
    }

    @Transactional
    @Override
    public EventCriteriaResponse createEventCriteria(UUID eventId, CreateEventCriteriaRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = findEvent(eventId);

        assertEventCriteriaEditable(event);
        validateEventCriteriaRequest(request);

        ScoringCriteria template = null;
        if (request.criteriaId() != null) {
            template = findScoringCriteria(request.criteriaId());
            if (Boolean.FALSE.equals(template.getIsActive())) {
                throw new ConflictException("Scoring criteria is not active");
            }

            if (eventCriteriaRepository.existsByEventIdAndCriteriaIdAndIsActiveTrue(
                    eventId,
                    template.getId())
            ) {
                throw new ConflictException("This template is already active in this event criteria list");
            }
        }

        List<UUID> roundIds = validateAndNormalizeRoundIds(eventId, request.appliesToRoundIds());

        EventCriteria criteria = new EventCriteria();
        criteria.setEvent(event);
        criteria.setCriteria(template);
        criteria.setNameOverride(trimToNull(request.nameOverride()));
        criteria.setDescriptionOverride(trimToNull(request.descriptionOverride()));
        criteria.setRubricOverride(trimToNull(request.rubricOverride()));
        criteria.setWeightOverride(toNullableFloat(request.weightOverride(), "weightOverride"));
        criteria.setMaxScoreOverride(toNullableFloat(request.maxScoreOverride(), "maxScoreOverride"));
        criteria.setIsTechnicalOverride(request.isTechnicalOverride());
        criteria.setAppliesToRoundIds(roundIds);
        criteria.setDisplayOrder(request.displayOrder() == null
                ? nextEventCriteriaOrder(eventId) : request.displayOrder());
        criteria.setIsActive(true);

        if (template == null || criteria.getMaxScoreOverride() == null) {
            criteria.setMaxScoreOverride(10.0f);
        }

        if (template == null || criteria.getWeightOverride() == null) {
            criteria.setWeightOverride(1.0f);
        }
        
        validateEventCriteriaEntityBeforeSave(criteria);

        return toEventCriteriaResponse(eventCriteriaRepository.save(criteria));
    }

    @Transactional
    @Override
    public EventCriteriaResponse updateEventCriteria(UUID criteriaId, UpdateEventCriteriaRequest request, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public EventCriteriaResponse deleteEventCriteria(UUID criteriaId, Authentication authentication) {
        return null;
    }

    @Transactional(readOnly = true)
    @Override
    public List<EventCriteriaResponse> getCriteriaByRound(UUID roundId) {
        return List.of();
    }


    //HELPERS
    private CriteriaCategory parseCategoryOrNull(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("ALL")) {
            return null;
        }
        return parseCategory(category);

    }

    private CriteriaCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new BadRequestException("Category is required");
        }

        try {
            return CriteriaCategory.valueOf(category.trim().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid criteria category " + category);
        }
    }

    private ScoringCriteriaResponse toScoringCriteriaResponse(ScoringCriteria criteria) {
        return new ScoringCriteriaResponse(
                criteria.getId(),
                criteria.getName(),
                criteria.getDescription(),
                criteria.getRubric(),
                criteria.getMaxScore() == null ? null : criteria.getMaxScore().doubleValue(),
                criteria.getDefaultWeight() == null ? null : criteria.getDefaultWeight().doubleValue(),
                criteria.getCategory() == null ? null : criteria.getCategory().name(),
                criteria.getIsTechnical(),
                criteria.getIsDefault(),
                criteria.getIsActive()
        );
    }

    private void validateCreateScoringCriteriaRequest(CreateScoringCriteriaRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BadRequestException("Criteria name is required");
        }

        parseCategory(request.category());

        toFloat(request.maxScore(), "maxScore");
        toFloat(request.defaultWeight(), "defaultWeight");
    }

    private Float toFloat(Double value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(fieldName + " is required");
        }
        float result = value.floatValue();

        if ((fieldName.toLowerCase().contains("max") && result <= 0)
                || (fieldName.toLowerCase().contains("weight") && result < 0)) {

            throw new BadRequestException(fieldName + " has invalid value");
        }

        return result;
    }

    private Float toNullableFloat(Double value, String fieldName) {
        return value == null ? null : toFloat(value, fieldName);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Boolean defaultTechnicalFlag(CriteriaCategory category) {
        return switch (category) {
            case TECHNICAL, PROCESS -> true;
            case PRESENTATION, BUSINESS, INNOVATION -> false;
        };
    }

    private ScoringCriteria findScoringCriteria(UUID criteriaId) {
        if (criteriaId == null) {
            throw new BadRequestException("Criteria id is required");
        }

        return scoringCriteriaRepository.findById(criteriaId)
                .orElseThrow(() -> new NotFoundException("Scoring criteria not found"));
    }

    private EventCriteriaResponse toEventCriteriaResponse(EventCriteria criteria) {
        ScoringCriteria template = criteria.getCriteria();

        return new EventCriteriaResponse(
                criteria.getId(),
                criteria.getEvent().getId(),
                template == null ? null : template.getId(),
                template == null ? null : template.getName(),
                template == null ? null : template.getCategory().name(),
                criteria.isCustomCriteria(),
                criteria.getNameOverride(),
                criteria.getDescriptionOverride(),
                criteria.getRubricOverride(),
                criteria.getWeightOverride() == null ? null : criteria.getWeightOverride().doubleValue(),
                criteria.getMaxScoreOverride() == null ? null : criteria.getMaxScoreOverride().doubleValue(),
                criteria.getIsTechnicalOverride(),
                criteria.getEffectiveName(),
                criteria.getEffectiveDescription(),
                criteria.getEffectiveRubric(),
                criteria.getEffectiveWeight() == null ? null : criteria.getEffectiveWeight().doubleValue(),
                criteria.getEffectiveMaxScore() == null ? null : criteria.getEffectiveMaxScore().doubleValue(),
                criteria.getEffectiveIsTechnical(),
                criteria.getAppliesToRoundIds(),
                criteria.getDisplayOrder(),
                criteria.getIsActive()
        );
    }

    private HackathonEvent findEvent(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required");
        }

        return hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));
    }

    private void assertEventCriteriaEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();
        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Event criteria cannot be modified in this status");
        }
    }

    private void validateEventCriteriaRequest(CreateEventCriteriaRequest request) {
        if (request.criteriaId() == null) {
            if (request.nameOverride() == null || request.nameOverride().isBlank()) {
                throw new BadRequestException("Custom event criteria name is required");
            }

            if (request.isTechnicalOverride() == null) {
                throw new BadRequestException("Custom event criteria technical must define in technical override");
            }
        }

        if (request.weightOverride() != null) {
            toFloat(request.weightOverride(), "weightOverride");
        }

        if (request.maxScoreOverride() != null) {
            toFloat(request.maxScoreOverride(), "maxScoreOverride");
        }
    }

    private List<UUID> validateAndNormalizeRoundIds(UUID eventId, List<UUID> roundIds) {
        if (roundIds == null || roundIds.isEmpty()) {
            return null;
        }

        Set<UUID> uniqueIds = new HashSet<>(roundIds);

        List<Round> eventRound = roundRepository.findByEventIdOrderByOrderIndexAsc(eventId);

        Set<UUID> validRoundIds = eventRound
                .stream()
                .map(Round::getId)
                .collect(Collectors.toSet());

        for (UUID roundId : uniqueIds) {
            if (!validRoundIds.contains(roundId)) {
                throw new BadRequestException("Round id " + roundId + " does not belong to this event");
            }
        }

        return new ArrayList<>(uniqueIds);
    }

    private int nextEventCriteriaOrder(UUID eventId) {
        Integer maxOrder = eventCriteriaRepository.findMaxDisplayOrderByEventId(eventId);

        return maxOrder == null ? 1 : maxOrder + 1;
    }

    private void validateEventCriteriaEntityBeforeSave(EventCriteria criteria) {
        if (criteria.getCriteria() == null) {
            if (criteria.getNameOverride() == null || criteria.getNameOverride().isBlank()) {
                throw new BadRequestException("Custom event criteria name is required");
            }

            if (criteria.getIsTechnicalOverride() == null) {
                throw new BadRequestException("Custom event criteria technical must define in technical override");
            }
        }
    }
}
