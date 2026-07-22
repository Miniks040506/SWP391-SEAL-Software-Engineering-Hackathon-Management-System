/**
 * Deterministic fallback banner gradient for an event that has no uploaded
 * banner image. Keyed by season so the SAME event shows the SAME colour across
 * every surface — the events list card, the coordinator edit page, and the
 * public / coordinator detail (view) page.
 *
 * Returns Tailwind gradient stops; apply together with a direction utility
 * such as `bg-linear-to-br` or `bg-linear-to-r`.
 */
/**
 * Deterministic fallback banner IMAGE for an event that has no uploaded
 * banner. Seeded by event id so the SAME event shows the SAME photo across
 * every surface (list card, public detail hero, ...). Picsum returns the same
 * photo for the same seed regardless of the requested dimensions.
 */
export function getEventFallbackBannerUrl(
  eventId: string,
  width: number,
  height: number,
): string {
  return `https://picsum.photos/seed/seal-event-${eventId}/${width}/${height}`;
}

export function getEventSeasonGradient(season?: string | null): string {
  switch ((season ?? "").toUpperCase()) {
    case "SPRING":
      return "from-emerald-600 via-teal-500 to-cyan-500";
    case "SUMMER":
      return "from-amber-500 via-orange-500 to-rose-500";
    case "FALL":
      return "from-violet-600 via-indigo-600 to-blue-500";
    default:
      return "from-blue-600 via-sky-500 to-indigo-600";
  }
}
