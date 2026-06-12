package com.t7.seal.repository;

import com.t7.seal.entities.AdvanceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdvanceRuleRepository extends JpaRepository<AdvanceRule, UUID> {

    List<AdvanceRule> findByRoundIdOrderByPriorityAscRuleTypeAsc(UUID roundId);
}
