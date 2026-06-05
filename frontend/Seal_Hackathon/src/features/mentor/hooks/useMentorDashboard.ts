import { useNavigate } from "react-router-dom";

import { mentorDashboardMock } from "../mocks/mentorDashboard.mock";

export function useMentorDashboard() {
  const navigate = useNavigate();

  const dashboard = mentorDashboardMock;

  const goToTeams = () => {
    navigate("/mentor/teams");
  };

  const goToSubmissions = () => {
    navigate("/mentor/submissions");
  };

  const goToSchedule = () => {
    navigate("/mentor/schedule");
  };

  const goToSubmissionDetail = (submissionId: string) => {
    navigate(`/mentor/submissions/${submissionId}`);
  };

  const goToFeedback = (submissionId: string) => {
    navigate(`/mentor/submissions/${submissionId}/feedback`);
  };

  return {
    dashboard,
    goToTeams,
    goToSubmissions,
    goToSchedule,
    goToSubmissionDetail,
    goToFeedback,
  };
}