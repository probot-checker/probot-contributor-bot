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
        try {
          const owner = context.payload.repository.owner.login
          const repo = context.payload.repository.name
          const number = context.payload.number
          const isBot = context.payload.pull_request.user.type === "Bot";
          const who = context.payload.pull_request.user.login || context.payload.pull_request.login
          //app.log("pR details", context.payload.pull_request)
          app.log("who", who)
          app.log("inside CLosed PR Bot 2")
          const isTargetDefaultBranch = context.payload.pull_request.head.repo.default_branch === context.payload.pull_request.base.ref;
          const fileChanged = context.payload.pull_request.changed_files;
          if(isBot) {
            app.log("Bot PR")
            return 
          }
          if(!isTargetDefaultBranch) {
            app.log("Target not default branch")
            return
          }
          if(fileChanged == 0) {
            app.log("no file changed");
            return
          }
          let page = 0
          const files = await context.github.pulls.listFiles({
              owner,
              repo,
              number,
              headers: {accept: 'application/vnd.github.v3.diff'},
              page,
              per_page: 100
          })
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
              if(contributionType !== "") {
                contributions.push(contributionType)  
              }
          }
          const action ="add"
          if(contributions.length > 0) {
            app.log("inside add")
            await probotProcessIssueComment({ context, who, action, contributions })  
          }
          return
        } catch(err) {
          app.log("err", err.message)
          app.log(err)
        }
    
        
  })

  app.on('issue_comment.created', async context => {
    app.log.trace(context)
    app.log("inside issue_comment")
    //await probotProcessIssueCommentSafe({ context })
  })
}
