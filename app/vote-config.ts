export const VOTE_CONFIG = {
  question: "Who will win the Ballon d'Or?",
  subtitle: "The boys decide. One vote per browser — you can change your mind.",
  commentatorLine:
    "يا سادة يا كرام… 51% مقابل 49%! الكرة الذهبية حائرة بين النجمين… فمن يحسم المعركة؟",
  candidates: {
    left: {
      id: "left" as const,
      name: "Left contender",
      image: "./assets/left-contender.webp",
      color: "blue" as const,
    },
    right: {
      id: "right" as const,
      name: "Right contender",
      image: "./assets/right-contender.webp",
      color: "green" as const,
    },
  },
};
