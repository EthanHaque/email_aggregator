/**
 * Sends a notification email containing details of unread messages from a specific Gmail label
 * within the last specified number of hours.
 */
function sendLabelNotification() {
  var label = "";
  var emailRecipient = "";
  var timeWindowHours = 2;

  var threads = getUnreadThreads(label, timeWindowHours);
  var messages = extractMessageDetails(threads);
  
  if (messages.length > 0) {
    sendEmailNotification(emailRecipient, `${label} Label Summary`, messages);
  } else {
    Logger.log("No new messages to notify.");
  }
}

/**
 * Searches Gmail for unread threads with a specific label within a given time window.
 * 
 * @param {string} label - The Gmail label to filter by.
 * @param {number} ageInHours - The age of messages to consider, in hours.
 * @returns {GmailThread[]} An array of GmailThread objects that match the query.
 */
function getUnreadThreads(label, ageInHours) {
  var query = `is:unread label:${label} newer_than:${ageInHours}h`;
  return GmailApp.search(query);
}

/**
 * Extracts relevant details from each unread message in the threads.
 * Formats this information as HTML for email notification.
 * 
 * @param {GmailThread[]} threads - An array of GmailThread objects.
 * @returns {string[]} An array of formatted HTML strings, each representing a message.
 */
function extractMessageDetails(threads) {
  var messages = [];

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messagesInThread = thread.getMessages();
    var lastMessage = messagesInThread[messagesInThread.length - 1]; 

    var subject = lastMessage.getSubject();
    var sender = lastMessage.getFrom();

    if (!subject) {
      subject = "(No Subject)";
    } else {
      subject = normalizeSubject(subject);
    }

    var formattedDate = Utilities.formatDate(lastMessage.getDate(), Session.getScriptTimeZone(), "MMM dd, yyyy HH:mm");
    
    var cleanSubject = escapeHtml(stripNonAscii(subject));
    var cleanSender = escapeHtml(stripNonAscii(sender));
    
    messages.push(`<p><strong>Sender:</strong> ${cleanSender} <br> <strong>Subject:</strong> ${cleanSubject} <br> <strong>Date:</strong> ${formattedDate}</p>`);
  }

  return messages;
}

/**
 * Escapes special characters in a string to their HTML entity equivalents.
 * Softly prevents injection and ensures proper rendering in emails (this is not truly safe).
 * 
 * @param {string} text - The input text that may contain special characters.
 * @returns {string} The text with special characters replaced by HTML entities.
 */
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '’': '&rsquo;',
    '“': '&ldquo;',
    '”': '&rdquo;'
  };

  return text.replace(/[&<>"'’“”]/g, function(m) { return map[m]; });
}

/**
 * Removes non-ASCII characters from a given string.
 * 
 * @param {string} text - The input text that may contain non-ASCII characters.
 * @returns {string} The text stripped of non-ASCII characters.
 */
function stripNonAscii(text) {
  return text.replace(/[^\x00-\x7F]/g, "");
}

/**
 * Normalizes the subject line by capitalizing the first letter of each word
 * and converting the rest to lowercase.
 * 
 * @param {string} subject - The original subject line of the email.
 * @returns {string} The normalized subject line.
 */
function normalizeSubject(subject) {
  return subject.toLowerCase().replace(/\b\w/g, function(char) {
    return char.toUpperCase();
  });
}


/**
 * Sends an email notification to the specified recipient, containing details of unread messages.
 * The message body is formatted as HTML.
 * 
 * @param {string} recipient - The email address to send the notification to.
 * @param {string} subject - The subject of the email notification.
 * @param {string[]} messages - An array of formatted HTML strings representing message details.
 */
function sendEmailNotification(recipient, subject, messages) {
  var messageBody = `<div style="font-family: 'Courier New', Courier, monospace;">${messages.join("")}</div>`;
  
  Logger.log("Sending email...");
  GmailApp.sendEmail(recipient, subject, "", {htmlBody: messageBody});
  Logger.log("Email sent.");
}
