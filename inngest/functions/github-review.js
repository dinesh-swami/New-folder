import { inngest } from "../client.js";
import { octokit } from "../../lib/github.js";

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
    //S1 : fetch the pull REquest information.
    const pullRequestInfo = await step.run(
      "fetch-pull-request-information",
      async () => {
        const { owner, repo, pull_number } = event.data;

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
  },
);
