migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.add(new BoolField({ name: 'is_public' }))
    users.fields.add(new TextField({ name: 'slug', pattern: '^[a-zA-Z0-9_-]+$' }))
    users.viewRule = 'id = @request.auth.id || is_public = true'
    users.listRule = 'id = @request.auth.id || is_public = true'
    app.save(users)

    const existingUsers = app.findRecordsByFilter('users', "slug = '' || slug = null", '', 1000, 0)
    for (let i = 0; i < existingUsers.length; i++) {
      existingUsers[i].set('slug', 'user_' + $security.randomString(8))
      app.saveNoValidate(existingUsers[i])
    }

    const usersUpdate = app.findCollectionByNameOrId('users')
    usersUpdate.addIndex('idx_users_slug', true, 'slug', "slug != ''")
    app.save(usersUpdate)

    const progress = app.findCollectionByNameOrId('user_progress')
    progress.viewRule =
      'user_id = @request.auth.id || is_available_to_mentor = true || user_id.is_public = true'
    progress.listRule =
      'user_id = @request.auth.id || is_available_to_mentor = true || user_id.is_public = true'
    app.save(progress)

    const projects = app.findCollectionByNameOrId('user_projects')
    projects.viewRule = 'user_id = @request.auth.id || user_id.is_public = true'
    projects.listRule = 'user_id = @request.auth.id || user_id.is_public = true'
    app.save(projects)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.removeIndex('idx_users_slug')
    users.fields.removeByName('is_public')
    users.fields.removeByName('slug')
    users.viewRule = 'id = @request.auth.id'
    users.listRule = 'id = @request.auth.id'
    app.save(users)

    const progress = app.findCollectionByNameOrId('user_progress')
    progress.viewRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || is_available_to_mentor = true)"
    progress.listRule =
      "@request.auth.id != '' && (user_id = @request.auth.id || is_available_to_mentor = true)"
    app.save(progress)

    const projects = app.findCollectionByNameOrId('user_projects')
    projects.viewRule = "@request.auth.id != ''"
    projects.listRule = "@request.auth.id != ''"
    app.save(projects)
  },
)
