migrate(
  (app) => {
    const domains = app.findCollectionByNameOrId('domains')
    domains.createRule = "@request.auth.id != ''"
    domains.updateRule = "@request.auth.id != ''"
    domains.deleteRule = "@request.auth.id != ''"
    app.save(domains)

    const topics = app.findCollectionByNameOrId('topics')
    topics.createRule = "@request.auth.id != ''"
    topics.updateRule = "@request.auth.id != ''"
    topics.deleteRule = "@request.auth.id != ''"
    app.save(topics)

    const userProgress = app.findCollectionByNameOrId('user_progress')
    userProgress.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || is_available_to_mentor = true)"
    userProgress.viewRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || is_available_to_mentor = true)"
    userProgress.fields.add(new TextField({ name: 'notes' }))
    userProgress.fields.add(new URLField({ name: 'evidence_url' }))
    userProgress.fields.add(new BoolField({ name: 'is_available_to_mentor' }))
    app.save(userProgress)
  },
  (app) => {
    const domains = app.findCollectionByNameOrId('domains')
    domains.createRule = null
    domains.updateRule = null
    domains.deleteRule = null
    app.save(domains)

    const topics = app.findCollectionByNameOrId('topics')
    topics.createRule = null
    topics.updateRule = null
    topics.deleteRule = null
    app.save(topics)

    const userProgress = app.findCollectionByNameOrId('user_progress')
    userProgress.listRule = "@request.auth.id != '' && user_id = @request.auth.id"
    userProgress.viewRule = "@request.auth.id != '' && user_id = @request.auth.id"
    userProgress.fields.removeByName('notes')
    userProgress.fields.removeByName('evidence_url')
    userProgress.fields.removeByName('is_available_to_mentor')
    app.save(userProgress)
  },
)
