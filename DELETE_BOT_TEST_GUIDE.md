# 🧪 Delete Bot Feature - Quick Test Guide

## Prerequisites

Ensure both servers are running:

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Both should be running before testing.

---

## Test Scenario 1: Successful Deletion ✅

### Steps:

1. **Create a bot:**

   - Open `http://localhost:5173` in browser
   - Enter any website URL (e.g., `https://www.wikipedia.org`)
   - Wait for status to show "Ready" (green pulsing dot)

2. **Delete the bot:**

   - Hover over the bot card in the sidebar
   - Click the trash icon button
   - A confirmation dialog should appear

3. **Confirm deletion:**
   - Click "OK" in the confirmation dialog
   - Watch the delete button show a spinning loader
   - The bot should disappear from the sidebar immediately

### Expected Results:

- ✅ Bot removed from sidebar
- ✅ If bot was active, chat window closes and returns to Hero
- ✅ Spinner appears momentarily then disappears
- ✅ No error message shown
- ✅ Console shows: `✅ Bot deleted successfully: [botId]`

### Verify Deletion:

- Refresh the page (F5)
- Bot should NOT reappear (confirmed deleted from MongoDB)

---

## Test Scenario 2: Cancel Deletion ❌

### Steps:

1. Create a bot (same as above)
2. Hover over bot and click trash icon
3. Click "Cancel" in the confirmation dialog

### Expected Results:

- ✅ No API call is made
- ✅ Bot remains in sidebar unchanged
- ✅ No error message shown
- ✅ Sidebar state is unchanged

---

## Test Scenario 3: Delete Active Bot 🔄

### Steps:

1. Create a bot and wait for "Ready" status
2. Click on the bot to open chat
3. While in chat, hover over the bot in the sidebar
4. Click trash icon and confirm deletion

### Expected Results:

- ✅ Chat window closes immediately
- ✅ Returns to Hero page
- ✅ Bot removed from sidebar
- ✅ Spinner shows during deletion
- ✅ No error message

---

## Test Scenario 4: Error Handling 🚨

### Scenario A: Network Error

**Setup:** Disconnect internet or disable network

### Steps:

1. Create a bot
2. Hover and click delete
3. Confirm deletion while network is disabled

### Expected Results:

- ✅ Error banner appears: "Failed to delete chatbot. Please try again."
- ✅ Error banner has a close button (✕)
- ✅ Bot remains in sidebar (not deleted)
- ✅ Spinner disappears from button
- ✅ Console shows error

### Scenario B: Invalid Bot ID (Simulated)

This would require backend testing with curl.

---

## Console Output Reference

### Success Flow

```
// Browser Console (Frontend)
✅ Bot deleted successfully: 507f1f77bcf86cd799439011
🗑️ Chatbot deleted: 507f1f77bcf86cd799439011

// Backend Console
✅ MongoDB Record Deleted: 507f1f77bcf86cd799439011
🗑️ Supabase Vectors Deleted for chatbot: 507f1f77bcf86cd799439011
```

### Error Flow

```
// Browser Console (Frontend)
❌ Failed to delete bot: Error: Network Error
Delete bot error: Error: Request failed with status code 500

// Backend Console
❌ Deletion Error: Error: [specific error message]
```

---

## Visual Check List

As you test, verify these visual elements:

### Before Hover

- [ ] Bot card shows name and status badge
- [ ] Status badge shows correct color (teal=Ready, amber=Processing, red=Error)
- [ ] No delete button visible

### After Hover

- [ ] Trash icon appears on the right side of bot card
- [ ] Trash icon is gray initially
- [ ] Trash icon button is slightly visible as hover target

### During Delete Click

- [ ] Confirmation dialog appears (system dialog)
- [ ] Dialog says: "Are you sure you want to delete this chatbot? This action cannot be undone."

### During Deletion

- [ ] Trash icon is replaced with spinning loader
- [ ] Loader has red color (red-400)
- [ ] Button is disabled (appears slightly different)
- [ ] Can't click button again during deletion

### After Deletion (Success)

- [ ] Bot card fades out and removes from list
- [ ] Sidebar scrolls up if bot was at bottom
- [ ] No error message appears
- [ ] Loader disappears

### After Deletion (Error)

- [ ] Red error banner appears at top of sidebar
- [ ] Error message is readable and descriptive
- [ ] Close button (✕) is visible on banner
- [ ] Error auto-dismisses after 5 seconds
- [ ] Bot remains in sidebar

---

## API Response Verification

### Using Browser DevTools (Network Tab)

1. Open DevTools (F12)
2. Go to Network tab
3. Delete a bot
4. Look for request named: `DELETE /api/chatbot/...`
5. Click on it and check:

**Request:**

- Method: `DELETE`
- URL: `http://localhost:3000/api/chatbot/[botId]`
- Status: Should be `200` for success

**Response:**

```json
{
  "message": "Chatbot deleted successfully!",
  "chatbotId": "507f1f77bcf86cd799439011",
  "deletedBot": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://example.com",
    "name": "example.com",
    "status": "ready",
    "createdAt": "2025-12-18T12:00:00.000Z"
  }
}
```

---

## Troubleshooting

### Problem: Delete button not appearing on hover

- **Solution:** Ensure Sidebar component received `onDeleteBot` prop from App
- **Check:** Look for `onDeleteBot={handleDeleteBot}` in App.jsx line ~120

### Problem: Spinner not showing

- **Solution:** Check if `deletingId` state is being set correctly
- **Check:** Verify `setDeletingId(botId)` is called in handleDeleteBot

### Problem: Bot not disappearing from sidebar

- **Solution:** Check if `setBots(prev => ...)` filter is working
- **Check:** Console should show the deletion was successful before UI updates

### Problem: Error banner not showing

- **Solution:** Verify `setDeleteError` is being called on error catch
- **Check:** Error banner JSX is present in Sidebar return statement

### Problem: Confirmation dialog not appearing

- **Solution:** Check if `window.confirm()` is being called
- **Check:** Verify first line in handleDeleteBot is calling confirm dialog

---

## Database Verification (Advanced)

After successful deletion, verify data was removed from both databases:

### MongoDB

```bash
# In MongoDB Compass or mongosh:
db.chatbots.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
# Expected: null (document doesn't exist)
```

### Supabase

```sql
-- In Supabase SQL Editor:
SELECT * FROM documents
WHERE metadata->>'chatbot_id' = '507f1f77bcf86cd799439011';
-- Expected: 0 rows (all vectors deleted)
```

---

## Summary Checklist

After testing all scenarios, verify:

- [ ] Scenario 1: Successful deletion works (bot disappears)
- [ ] Scenario 2: Cancel prevents deletion (bot stays)
- [ ] Scenario 3: Deleting active bot closes chat
- [ ] Scenario 4: Error handling shows proper messages
- [ ] Visual: Spinner appears during deletion
- [ ] Visual: Error banner appears on errors
- [ ] Network: DELETE request sent correctly
- [ ] Database: Bot removed from MongoDB after refresh
- [ ] Console: Proper logs appear for success and errors

✅ **All tests passing?** → Delete feature is ready for production!

---

_Test Guide: December 18, 2025_
