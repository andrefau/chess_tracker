export function calculateElo(ratingA: number, ratingB: number, actualScoreA: number, kFactor = 96) {
    const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const newRatingA = ratingA + kFactor * (actualScoreA - expectedScoreA);
    return Math.round(newRatingA);
}
