onRecordDelete((e) => {
  const projectId = e.record.id

  try {
    const userProjects = $app.findRecordsByFilter(
      'user_projects',
      `project_id='${projectId}'`,
      '',
      0,
      0,
    )
    for (const up of userProjects) {
      $app.delete(up)
    }
  } catch (err) {}

  e.next()
}, 'projects')
