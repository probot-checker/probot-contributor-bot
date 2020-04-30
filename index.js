const probotProcessIssueComment = require('./src/tasks/processIssueComment/probot-processIssueComment.js');

module.exports = (app) => {
  // Your code here
  app.log('Yay! The app was loaded!')

  // example of probot responding 'Hello World' to a new issue being opened
  app.on(['issues.opened','issues.closed'], async context => {
    // `context` extracts information from the event, which can be passed to
    // GitHub API calls. This will return:
    //   {owner: 'yourname', repo: 'yourrepo', number: 123, body: 'Hello World!}
    const params = context.issue({body: 'Hello World!'})
    app.log()
    // Post a comment on the issue
    return context.github.issues.createComment(params)
  })

  
  app.on(['pull_request.opened','pull_request.closed'], async context => {
        console.log("inside CLosed PR Bot 1")
        try {
          const owner = context.payload.repository.owner.login
          const repo = context.payload.repository.name
          const number = context.payload.number
          const who = context.payload.pull_request.user.login || context.payload.pull_request.login
          app.log("contributor 1", context.payload.pull_request)
          app.log("who", who)
          app.log("inside CLosed PR Bot 2")
          if(who === "amazing-experienced-owl[bot]") {
            app.log("Bot PR")
            return 
          }
          const comments = []
          let page = 0
          while (true) {
              const files = await context.github.pulls.listFiles({
                  owner,
                  repo,
                  number,
                  headers: {accept: 'application/vnd.github.v3.diff'},
                  page,
                  per_page: 100
              })
              app.log("CLosed files", files)
              const contributions = []
              for (const file of files.data) {
                  let contributionType = ""
                  if (file.filename.endsWith('.test.js') || file.filename.endsWith('.test.ts')) {
                    contributionType = "test"
                  } else if (file.filename.endsWith('.js') || file.filename.endsWith('.ts')) {
                    contributionType = "code"
                  } else if (file.filename.endsWith('.md') || file.filename.endsWith('.txt')) {
                    contributionType = "doc"
                  }
                  app.log("type", contributionType)
                  contributions.push(contributionType)
              }
              const action ="add"
              await probotProcessIssueComment({ context, who, action, contributions })
              page += 1
              return
          }
        } catch(err) {
          console.log(err.message)
          app.log(err.trace)
          app.log(err.message)
        }
    
        
  })

  app.on('issue_comment.created', async context => {
    app.log.trace(context)
    app.log("inside issue_comment")
    //await probotProcessIssueCommentSafe({ context })
  })
}
