export const users = [
  { id: "u1", username: "amara_codes", displayName: "Amara" },
  { id: "u2", username: "tomek_b", displayName: "Tomek" },
  { id: "u3", username: "kesh_dev", displayName: "Kesh" },
];

export const posts = [
  {
    id: 1,
    author: "amara_codes",
    authorId: "u1",
    avatar: "AK",
    title: "Why I finally moved off REST for internal tools",
    excerpt:
      "Spent a weekend rewriting our admin API in tRPC. Here's what got simpler, what got worse, and the one migration trap that cost me a whole afternoon.",
    time: "3h ago",
    tags: ["api-design", "typescript"],
    comments: 18,
    upvotes: 42,
    downvotes: 7,
    userVote: "none",
    body: `
      <p>Spent a weekend rewriting our internal admin API in tRPC. The old REST version had drifted for two years — routes that didn't match the client's expectations anymore, a Postman collection nobody trusted, and a types package we had to remember to rebuild by hand.</p>
      <p>The biggest win was immediate: end-to-end types. No more guessing whether <code>GET /admin/users/:id</code> returns <code>lastLoginAt</code> as a string or a number.</p>
      <pre><code>const user = await trpc.admin.users.byId.query({ id });
// user is fully typed, no fetch(), no manual parsing</code></pre>
      <p>What got worse: caching. REST gave us free HTTP caching semantics we didn't realize we were leaning on. We had to rebuild some of that manually on the client.</p>
      <p>The migration trap: our auth middleware assumed a REST-style request object, and tRPC's context setup runs before that middleware in a way I didn't expect — cost me an entire afternoon to untangle.</p>
    `,
    commentList: [
      {
        author: "tomek_b",
        avatar: "TB",
        time: "2h ago",
        text: "The caching trade-off is real. We ended up putting React Query on top of tRPC just to claw back some of what we lost from HTTP caching.",
      },
      {
        author: "kesh_dev",
        avatar: "KD",
        time: "1h ago",
        text: "Curious how you're handling public-facing endpoints — did you keep those on REST or go full tRPC there too?",
      },
      {
        author: "amara_codes",
        avatar: "AK",
        time: "45m ago",
        text: "Kept REST for anything public — tRPC's coupling to a TS client isn't worth it once you don't control who's calling the API.",
      },
    ],
  },
  {
    id: 2,
    author: "tomek_b",
    authorId: "u2",
    avatar: "TB",
    title: "Async/await gotchas that still trip me up in Node",
    excerpt:
      "A running list of the mistakes I keep making with Promise.all, unhandled rejections, and forgetting that forEach doesn't await anything.",
    time: "7h ago",
    tags: ["node.js", "async"],
    comments: 9,
    upvotes: 27,
    downvotes: 5,
    userVote: "none",
    body: `
      <p>Every few weeks I still forget that <code>forEach</code> does not await async work and that a rejected promise without a catch can vanish inside a fire-and-forget loop.</p>
      <p>My current checklist is small but reliable: promise boundaries, unhandled rejection listeners, re-entrancy, and aborting long-running tasks when the request goes away.</p>
      <pre><code>await Promise.all(tasks.map(task => runTask(task)));
// treat each task as a boundary, not as a side effect</code></pre>
      <p>The bug pattern I keep revisiting is not about the async syntax itself — it's the assumptions around when the work is actually complete.</p>
    `,
    commentList: [
      {
        author: "amara_codes",
        avatar: "AK",
        time: "5h ago",
        text: "The memo here is that Promise.all is not a magic fix if one routine stalls forever.",
      },
      {
        author: "kesh_dev",
        avatar: "KD",
        time: "3h ago",
        text: "I keep a tiny helper to wrap each task in a timeout so the failure mode stays obvious.",
      },
    ],
  },
  {
    id: 3,
    author: "kesh_dev",
    authorId: "u3",
    avatar: "KD",
    title: "Show devfeed: a tiny CLI for scaffolding Express routes",
    excerpt:
      "Built this to stop copy-pasting the same controller/route/service boilerplate. Takes a resource name and generates the files with tests included.",
    time: "1d ago",
    tags: ["express", "cli", "show-devfeed"],
    comments: 5,
    upvotes: 15,
    downvotes: 3,
    userVote: "none",
    body: `
      <p>I built a tiny CLI to stop copy-pasting the same route/controller boilerplate on every Express project. It turns a resource name into a ready-to-edit folder structure with handlers and tests.</p>
      <p>The thing I wanted most was less ceremony and more confidence. The generator is intentionally opinionated, so we can keep style consistent without turning the project into a framework.</p>
      <pre><code>devfeed scaffold users
# generates routes, controller, service, tests</code></pre>
      <p>It isn't meant to replace architecture choices; it's just there to remove the repetitive parts so the team can focus on the risky bits.</p>
    `,
    commentList: [
      {
        author: "tomek_b",
        avatar: "TB",
        time: "18h ago",
        text: "This is exactly the kind of tool I end up writing in a side quest and then never shipping.",
      },
      {
        author: "amara_codes",
        avatar: "AK",
        time: "12h ago",
        text: "The best scaffolds feel opinionated without feeling heavy.",
      },
    ],
  },
  {
    id: 4,
    author: "amara_codes",
    authorId: "u1",
    avatar: "AK",
    title: "Debugging a slow memory leak in a long-running Express server",
    excerpt:
      "Heap snapshots, --inspect, and a stubborn event listener that never got removed. Walking through how I finally traced it.",
    time: "2d ago",
    tags: ["debugging", "performance"],
    comments: 12,
    upvotes: 9,
    downvotes: 2,
    userVote: "none",
    body: `
      <p>We had a node process that looked healthy in logs but kept consuming memory until the machine started swapping. The first clue was a steady climb in event listeners, even when the app looked idle.</p>
      <p>The fix was simple but annoying: tracing where the listeners were bound and ensuring the unsubscribe path ran on shutdown and on retry.</p>
      <pre><code>node --inspect-brk app.js
# pause, take heap snapshot, compare listener counts</code></pre>
      <p>The memory leak wasn't caused by the framework; it was a subtle lifecycle bug in a shared queue that never removed listeners when the consumer was replaced.</p>
    `,
    commentList: [
      {
        author: "kesh_dev",
        avatar: "KD",
        time: "23h ago",
        text: "The hidden cost of a shared queue is that the leak only shows up under exactly the right churn pattern.",
      },
    ],
  },
];

export const newsItems = [
  {
    title: "New post in the feed",
    detail:
      "A note about improved API testing workflows landed in the community feed.",
    time: "2m ago",
  },
  {
    title: "Node debugging thread trending",
    detail:
      "Developers are discussing memory profiling and long-lived worker processes.",
    time: "8m ago",
  },
  {
    title: "Express tooling update",
    detail:
      "A new route scaffolding tool is getting attention from people building quick prototypes.",
    time: "17m ago",
  },
  {
    title: "Design system cleanup",
    detail:
      "The terminal/editorial styling pass is being refined for better contrast and readability.",
    time: "24m ago",
  },
  {
    title: "Release notes shared",
    detail:
      "The team dropped a note about the next learning milestone: frontend polish and live notification UI.",
    time: "44m ago",
  },
];
