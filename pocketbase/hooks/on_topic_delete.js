onRecordDelete((e) => {
  const topicId = e.record.id

  try {
    const progresses = $app.findRecordsByFilter('user_progress', `topic_id='${topicId}'`, '', 0, 0)
    for (const p of progresses) {
      $app.delete(p)
    }
  } catch (err) {}

  try {
    const resources = $app.findRecordsByFilter('resources', `topic_id='${topicId}'`, '', 0, 0)
    for (const r of resources) {
      $app.delete(r)
    }
  } catch (err) {}

  e.next()
}, 'topics')
