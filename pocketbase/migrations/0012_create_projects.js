migrate(
  (app) => {
    const projects = new Collection({
      name: 'projects',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'domain_id',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('domains').id,
          required: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'difficulty',
          type: 'select',
          values: ['Beginner', 'Intermediate', 'Advanced', 'Senior'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(projects)

    const userProjects = new Collection({
      name: 'user_projects',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        {
          name: 'project_id',
          type: 'relation',
          collectionId: projects.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['Not Started', 'In Progress', 'Completed'],
          required: true,
          maxSelect: 1,
        },
        { name: 'repo_url', type: 'url' },
        { name: 'demo_url', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_projects_user_project ON user_projects (user_id, project_id)',
      ],
    })
    app.save(userProjects)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('user_projects'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('projects'))
    } catch (_) {}
  },
)
