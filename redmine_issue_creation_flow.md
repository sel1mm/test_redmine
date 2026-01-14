# Issue Creation Request Flow

This document describes a request–response flow when creating an Issue in a Redmine-based system.  

---

## 1. Client Sends Create Issue Request
- HTTP Method: `POST`
- Endpoint: `/projects/{project_identifier}/issues`
- Request Format: HTML / JSON (depending on client)
- Client: Web browser or API consumer

The request is initiated when a user submits the *New Issue* form.

---

## 2. Request Processing
- Controller: `IssuesController#create`
- Authentication: User session is validated
- Authorization: User permissions are checked against the target project

---

## 3. Request Parameters
Typical data included in the request:

### Core Issue Fields
- Subject
- Description
- Tracker
- Status
- Priority
- Assigned user
- Version / Milestone
- Start date
- Due date
- Estimated time
- Progress ratio

### Optional Data
- Parent issue
- Watchers
- Custom field values (text, number, date, list, URL, file, etc.)
- Attachments

All parameters are validated before persistence.

---

## 4. Issue Persistence
- A new Issue record is created in the database
- Related data is saved:
  - Custom field values
  - Attachments
  - Watchers
  - Relations (if any)

If validation fails, the request is rejected and the form is re-rendered with errors.

---

## 5. Post-Creation Actions
After successful creation:

- The system enqueues background jobs, such as:
  - Email notifications
  - Activity logging
  - Hooks / plugins callbacks
- These jobs are executed asynchronously using ActiveJob

---

## 6. Redirect Response
- HTTP Status: `302 Found`
- Redirect Target:  
  ```
  /issues/{issue_id}
  ```

This prevents duplicate submissions and follows the PRG (Post/Redirect/Get) pattern.

---

## 7. Issue Display Request
- HTTP Method: `GET`
- Endpoint: `/issues/{issue_id}`
- Controller: `IssuesController#show`

The system loads:
- Issue details
- Custom fields
- Attachments
- Journals / history
- Related entities

---

## 8. Background Job Execution
- Notification emails are rendered (text + HTML)
- Emails are delivered to relevant users
- Failures are logged without blocking the main request

---

## 9. Request Completion
- HTTP Status: `200 OK`
- Page is fully rendered and returned to the client
- Database queries, view rendering, and garbage collection are completed

---


