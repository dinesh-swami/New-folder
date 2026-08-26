import { Agent } from "@openai/agents";
import { z } from "zod";

export const GithubReviewAgentResultSchema = z.object({
  criticalFixes: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("critical fixed if any"),
  suggestioins: z
    .array(z.string())
    .optional()
    .nullable()
    .describe("suggestions fixed if any"),
  content: z.string().describe("Actual content for the reply"),
});

export const githubPullRequestReviewAgent = new Agent({
  name: "Github Pull Request",
  outputType: GithubReviewAgentResultSchema,
  instructions: `
  you are an expert Ai code reviewer.
  You are an given pull request details with some basic information about the pull request
  and the changes in that pull requests.
  Given a detailed review about the code and suggest some fixes if have any, your comments, etc.
  use emjies in comments to make it natural.
  `,
});
