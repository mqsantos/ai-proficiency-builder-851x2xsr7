migrate(
  (app) => {
    const topicsCol = app.findCollectionByNameOrId('topics')

    const progress = new Collection({
      name: 'user_progress',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'topic_id',
          type: 'relation',
          required: true,
          collectionId: topicsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['unstarted', 'learning', 'mastered'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_progress_user_topic ON user_progress (user_id, topic_id)',
      ],
    })
    app.save(progress)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('user_progress')
    app.delete(col)
  },
)
