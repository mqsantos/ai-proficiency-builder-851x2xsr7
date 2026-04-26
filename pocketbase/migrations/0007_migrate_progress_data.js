migrate(
  (app) => {
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'None' WHERE status = 'unstarted'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'Learning' WHERE status = 'learning'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'Expert' WHERE status = 'mastered'`)
      .execute()
  },
  (app) => {
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'unstarted' WHERE status = 'None'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'learning' WHERE status = 'Learning'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'mastered' WHERE status = 'Expert'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'mastered' WHERE status = 'Mentor of Others'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE user_progress SET status = 'learning' WHERE status = 'Familiar'`)
      .execute()
  },
)
