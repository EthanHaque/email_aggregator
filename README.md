# Email Summarizer by Label

Script that summarizes unread emails under a specific Gmail label and sends the summary via email.

## Setup Instructions

1. **Create Project**: Start a new Apps Script project.
2. **Add Code**: Copy `main.js` contents into `Code.gs`.
3. **Configure Settings**:
   - Set `emailRecipient` to your email in the `sendLabelNotification()` function.
   - Set the `label` to your desired Gmail label in the `sendLabelNotification()` function.
4. **Test**: 
   - Select `sendLabelNotification` in the Apps Script editor top bar.
   - Ensure there are unread emails under the specified label recieved in the last `timeWindowHours` number of hours.
   - Click **Run**.
5. **Set Up Automatic Triggers**:
   - Click the alarm clock icon in the left sidebar.
   - Add a trigger with these values:
     - Function to run: `SendLabelNotification`.
     - Deployment: `Head`.
     - Event source: `Time-driven`.
     - Time-based trigger: `Hour timer`.
     - Interval: Every 2 hours (same as `timeWindowHours`).