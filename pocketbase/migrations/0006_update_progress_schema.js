migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('user_progress')
    const field = col.fields.getByName('status')

    if (field) {
      field.values = ['None', 'Learning', 'Familiar', 'Expert', 'Mentor of Others']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('user_progress')
    const field = col.fields.getByName('status')

    if (field) {
      field.values = ['unstarted', 'learning', 'mastered']
      app.save(col)
    }
  },
)
