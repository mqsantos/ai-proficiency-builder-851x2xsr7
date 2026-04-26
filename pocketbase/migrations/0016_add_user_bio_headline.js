migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.add(new TextField({ name: 'bio' }))
    col.fields.add(new TextField({ name: 'headline' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.fields.removeByName('bio')
    col.fields.removeByName('headline')
    app.save(col)
  },
)
