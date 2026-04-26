onRecordAfterUpdateSuccess((e) => {
  const newStatus = e.record.getString('status')
  const oldStatus = e.record.original().getString('status')

  const xpMap = {
    None: 0,
    Learning: 25,
    Familiar: 50,
    Expert: 100,
    'Mentor of Others': 200,
  }

  const oldXp = xpMap[oldStatus] || 0
  const newXp = xpMap[newStatus] || 0
  const xpToAdd = newXp - oldXp

  const userId = e.record.getString('user_id')
  if (!userId || xpToAdd === 0) return e.next()

  const user = $app.findRecordById('users', userId)

  let currentXp = user.getInt('xp')
  user.set('xp', currentXp + xpToAdd)

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
}, 'user_progress')
