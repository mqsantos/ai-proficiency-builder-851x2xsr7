migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('xp')) {
      users.fields.add(new NumberField({ name: 'xp', min: 0 }))
    }
    if (!users.fields.getByName('streak_count')) {
      users.fields.add(new NumberField({ name: 'streak_count', min: 0 }))
    }
    if (!users.fields.getByName('last_activity_at')) {
      users.fields.add(new DateField({ name: 'last_activity_at' }))
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('xp')
    users.fields.removeByName('streak_count')
    users.fields.removeByName('last_activity_at')
    app.save(users)
  },
)
