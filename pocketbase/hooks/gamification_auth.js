onRecordAuthRequest((e) => {
  const user = e.record
  if (!user || user.collection().name !== 'users') return e.next()

  const now = new Date()
  const lastActivityStr = user.getString('last_activity_at')
  let streak = user.getInt('streak_count')

  if (!lastActivityStr) {
    streak = 1
  } else {
    const lastActivity = new Date(lastActivityStr)
    const diffMs = now.getTime() - lastActivity.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours > 48) {
      streak = 1
    } else if (now.toDateString() !== lastActivity.toDateString()) {
      streak += 1
    }
  }

  user.set('streak_count', streak)
  user.set('last_activity_at', now.toISOString())

  $app.saveNoValidate(user)

  e.next()
}, 'users')
