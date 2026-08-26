import { inngest } from "../client.js";

export const githubPullRequestReview = inngest.createFunction({
    id: 'github-pr-review',
    triggers: [
        {
            event: "github/pull_request.review"
        }
    ]
}, async () => { return 'hello world' })