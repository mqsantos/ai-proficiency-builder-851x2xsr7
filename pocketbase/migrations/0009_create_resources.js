migrate(
  (app) => {
    const topicsCol = app.findCollectionByNameOrId('topics')
    const collection = new Collection({
      name: 'resources',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'topic_id',
          type: 'relation',
          required: true,
          collectionId: topicsCol.id,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'url', type: 'url', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['Video', 'Article', 'Course', 'Documentation'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('resources')
    app.delete(collection)
  },
)
