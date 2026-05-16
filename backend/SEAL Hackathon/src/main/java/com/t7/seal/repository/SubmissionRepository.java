package com.t7.seal.repository;

import com.t7.seal.entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

}
