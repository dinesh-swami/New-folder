import { inngest } from "../client.js";
import { octokit } from "../../lib/github.js";
import { run } from "@openai/agents";
import { githubPullRequestReviewAgent } from "../../agents/github-pr-review-agent.js";

export const githubPullRequestReview = inngest.createFunction(
  {
    id: "github-pr-review",
    triggers: [
      {
        event: "github/pull_request.review",
      },
    ],
  },
  async ({ event, step }) => {
    const { owner, repo, pull_number } = event.data;
    //S1 : fetch the pull REquest information.
    const pullRequestInfo = await step.run(
      "fetch-pull-request-information",
      async () => {
        try {
          const pullRequestObject = await octokit.pulls.get({
            owner,
            repo,
            pull_number,
          });

          return {
            id: pullRequestObject.data.id,
            title: pullRequestObject.data.title,
            state: pullRequestObject.data.state,
            number: pullRequestObject.data.number,
            comments: pullRequestObject.data.comments,
            url: pullRequestObject.data.url,
            diff_url: pullRequestObject.data.diff_url,
            changed_files: pullRequestObject.data.changed_files,
            commits: pullRequestObject.data.commits,
          };
        } catch (error) {
          console.log(error);
          return "kuch to fata";
        }
      },
    );

    if (!pullRequestInfo)
      return {
        message: "pull Request not found",
        skipped: true,
      };
    if (pullRequestInfo.state !== "open")
      return {
        message: "pull request is not open ,Skipping the review",
        skipping: true,
        completed: false,
      };

    /**
     *
     *
     * step 2 : this step retrive changes
     *
     *
     *
     */

    const chagnes = await step.run("fetch-changes", async () => {
      const changesResult = await octokit.paginate(octokit.pulls.listFiles, {
        owner,
        repo,
        pull_number,
        per_page: 100,
      });
      console.log(changesResult);
      return changesResult.map((change) => ({
        filename: change.filename,
        status: change.status,
        changes: change.changes,
        patch: change.patch,
        additions: change.additions,
        deletions: change.deletions,
        previous_filename: change.previous_filename,
      }));
    });
    //
    if (chagnes.length === 0)
      return { message: "There are no changes in this pr", skipped: true };

    /**
     *
     *
     * step 3 : Analyze the output
     *
     *
     *
     */

    const aiResponse = await step.run("ai-analyze", async () => {
      const llmResponse = await run(
        githubPullRequestReviewAgent,
        `
         Pull Request Information:
         ${JSON.stringify(pullRequestInfo, null, 2)}
         \n\n
         Changes:
         ${JSON.stringify(chagnes, null, 2)}
        `,
      );
      return {
        result: llmResponse.finalOutput,
      };
    });
  },
);
