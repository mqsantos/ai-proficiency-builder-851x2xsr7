migrate(
  (app) => {
    const domains = new Collection({
      name: 'domains',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'text' },
        { name: 'color', type: 'text' },
        { name: 'slug', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_domains_slug ON domains (slug)'],
    })
    app.save(domains)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('domains')
    app.delete(col)
  },
)
