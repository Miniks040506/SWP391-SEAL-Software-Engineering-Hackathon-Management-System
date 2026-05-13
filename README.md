bash -lc cat > /mnt/data/README.md <<'EOF'
# SEAL - Software Engineering Hackathon Management System

A web-based platform for managing SEAL academic hackathon events organized by the Software Engineering Department and PDP at FPT University HCMC.

The system supports event setup, team registration, participant approval, round-based submissions, judge assignments, scoring, rankings, prizes, audit logs, and research data collection for inter-rater reliability analysis.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Main Actors](#main-actors)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [System Modules](#system-modules)
- [Main Entities](#main-entities)
- [Research Support](#research-support)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Exported Reports](#exported-reports)
- [License](#license)

## Overview

SEAL, Software Engineering Agile League, is an annual academic hackathon competition for software engineering students. Each year includes three hackathon events:

- Spring Hackathon
- Summer Hackathon
- Fall Hackathon

Each hackathon event can include multiple competition rounds, such as qualification rounds and final rounds. Teams may include FPT students, students from partner universities, or mixed teams.

This project provides a centralized management system to replace manual workflows, reduce data errors, improve transparency, and support research into scoring consistency among hackathon judges.

## Problem Statement

The current SEAL hackathon management process is mostly manual and has several limitations:

- Team registration and category management are handled manually.
- Judges score teams using separate Excel files.
- Scores must be collected and merged manually.
- Communication between organizers, mentors, judges, and teams is limited.
- There is no audit log for scoring decisions or eliminations.
- Manual ranking and advancement decisions are slow and error-prone.

This system solves these issues by centralizing registration, event management, judging, scoring, ranking, and reporting.

## Main Actors

- Team Member
- Team Leader
- Mentor
- Judge
- Event Coordinator

## Core Features

### 1. Event and Round Management

- Create and manage hackathon events.
- Configure multiple rounds for each event.
- Set round deadlines.
- Assign judges to rounds.
- Define scoring criteria for each round.
- Configure advancement rules, such as top N teams per track advancing to the next round.

### 2. Scoring Criteria Management

- Maintain reusable default scoring criteria templates.
- Allow each event to inherit default criteria.
- Add, remove, or adjust criteria per event.
- Configure scoring weights for each criterion.

### 3. Track Management

- Create competition tracks/categories for each event.
- Assign mentors to tracks.
- Allow a lecturer to act as mentor for one track and judge for another track in the same event.

### 4. Team Management

- Create teams with 3 to 5 members.
- Assign a team leader.
- Register teams into a specific track.
- Manage team status and eligibility.

### 5. User Registration and Authentication

- Register using email and password.
- Authenticate users with JWT.
- Support participant classification:
  - FPT student with FPT student ID.
  - External student with student ID and university name.
- Require organizer approval before participants can join competitions.
- Allow organizers to create temporary guest judge accounts.

### 6. Submission Management

- Allow teams to submit work per round.
- Store project repository URL.
- Store demo URL.
- Store report or slide URL.
- Optionally integrate with GitHub or GitLab API to retrieve repository metadata.

### 7. Evaluation

- Allow judges to score submissions based on event-specific criteria.
- Store each judge's score separately.
- Assign internal judges and guest judges to specific rounds.
- Support round-based and track-based judging.

### 8. Scoring, Ranking, and Elimination

- Automatically calculate rankings by round, track, and event.
- Determine teams eligible for the next round.
- Allow organizers to eliminate teams or submissions that violate rules.
- Store elimination reasons.
- Maintain audit logs for scoring and elimination actions.

### 9. Prizes and Result Publication

- Assign prizes based on final ranking.
- Publish final results to participants.
- Export rankings and scoring reports.

### 10. Research Data Collection

- Store raw scores from each judge for each criterion and submission.
- Support calibration rounds using sample submissions.
- Display judge score distributions for calibration.
- Export anonymized scoring datasets as CSV.
- Provide dashboards showing score variance between judges per criterion.

## Tech Stack

### Frontend

- React
- JavaScript

### Backend

- Spring Boot
- Java
- Spring Security
- JWT Authentication
- Spring Data JPA

### Database

- Relational database
- Recommended options:
  - MySQL
  - PostgreSQL

## System Modules

```text
SEAL Hackathon Management System
├── Authentication & Authorization
├── User Approval Management
├── Event Management
├── Round Management
├── Track Management
├── Team Management
├── Mentor Assignment
├── Judge Assignment
├── Submission Management
├── Criteria Management
├── Scoring Management
├── Ranking & Advancement
├── Elimination & Audit Log
├── Prize Management
├── Result Publication
└── Research Data Export
