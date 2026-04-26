migrate(
  (app) => {
    const domains = app.findCollectionByNameOrId('domains')
    domains.fields.add(
      new SelectField({
        name: 'level',
        values: ['Beginner', 'Intermediate', 'Advanced', 'Senior'],
        maxSelect: 1,
      }),
    )
    domains.fields.add(new TextField({ name: 'duration' }))
    app.save(domains)

    const topics = app.findCollectionByNameOrId('topics')
    topics.fields.add(new BoolField({ name: 'is_gap_suggestion' }))
    app.save(topics)
  },
  (app) => {
    const domains = app.findCollectionByNameOrId('domains')
    domains.fields.removeByName('level')
    domains.fields.removeByName('duration')
    app.save(domains)

    const topics = app.findCollectionByNameOrId('topics')
    topics.fields.removeByName('is_gap_suggestion')
    app.save(topics)
  },
)
