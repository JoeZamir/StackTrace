export function countVotes(votes, targetType, targetId) {
    const relevant = votes.filter(v => v.targetType === targetType && v.targetId === targetId);
    return {
      upvotes: relevant.filter(v => v.direction === "up").length,
      downvotes: relevant.filter(v => v.direction === "down").length,
    };
}

export function getUserVote(votes, targetType, targetId, userId) {
    if (!userId) return "none";
    const match = votes.find(v => v.targetType === targetType && v.targetId === targetId && v.userId === userId);
    
    return match?.direction || "none";
}
