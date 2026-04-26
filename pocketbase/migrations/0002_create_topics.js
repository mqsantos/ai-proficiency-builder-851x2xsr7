migrate(
  (app) => {
    const domainsCol = app.findCollectionByNameOrId('domains')

    const topics = new Collection({
      name: 'topics',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'domain_id',
          type: 'relation',
          required: true,
          collectionId: domainsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'type', type: 'select', required: true, values: ['skill', 'tech'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(topics)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('topics')
    app.delete(col)
  },
)
