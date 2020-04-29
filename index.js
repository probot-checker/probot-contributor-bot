module.exports = (app) => {
  // Your code here
  app.log('Yay! The app was loaded!')

  // example of probot responding 'Hello World' to a new issue being opened
  app.on('issues.opened', async context => {
    // `context` extracts information from the event, which can be passed to
    // GitHub API calls. This will return:
    //   {owner: 'yourname', repo: 'yourrepo', number: 123, body: 'Hello World!}
    const params = context.issue({body: 'Hello World!'})

    // Post a comment on the issue
    return context.github.issues.createComment(params)
  })
  
  app.on(['pull_request.opened', 'pull_request.synchronize', 'pull_request.closed'], async context => {
        const owner = context.payload.repository.owner.login
        const repo = context.payload.repository.name
        const number = context.payload.number
        
        const comments = []
        let page = 0
        while (true) {
            const files = await context.github.pullRequests.getFiles({
                owner,
                repo,
                number,
                headers: {accept: 'application/vnd.github.v3.diff'},
                page,
                per_page: 100
            })

            for (const file of files.data) {
                let contributionType = ""
                if (file.filename.endsWith('.test.js') || file.filename.endsWith('.test.ts')) {
                  contributionType = "Tests"
                } else if (file.filename.endsWith('.js') || file.filename.endsWith('.ts')) {
                  contributionType = "Code"
                } else if (file.filename.endsWith('.md') || file.filename.endsWith('.txt')) {
                  contributionType = "Doc"
                }
                const params = context.issue({body: contributionType || 'Hello World!'})

                // Post a comment on the issue
                context.github.issues.createComment(params)
                console.log(context.github.issues)
            }
            page += 1
            return
        }
        
    })
}
