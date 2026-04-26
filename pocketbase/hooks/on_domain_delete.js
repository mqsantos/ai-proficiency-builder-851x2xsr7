onRecordDelete((e) => {
  const domainId = e.record.id

  try {
    const topics = $app.findRecordsByFilter('topics', `domain_id='${domainId}'`, '', 0, 0)
    for (const t of topics) {
      $app.delete(t)
    }
  } catch (err) {}

  try {
    const projects = $app.findRecordsByFilter('projects', `domain_id='${domainId}'`, '', 0, 0)
    for (const p of projects) {
      $app.delete(p)
    }
  } catch (err) {}

  e.next()
}, 'domains')
