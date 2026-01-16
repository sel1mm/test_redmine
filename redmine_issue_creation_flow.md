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

Example:
```json

{
  "issue": {
    "is_private": false,
    "tracker_id": 1,
    "subject": "Test flow data redmine",
    "description": "Test flow data redmine of description",
    "status_id": 1,
    "priority_id": 4,
    "assigned_to_id": 1,
    "fixed_version_id": 2,
    "parent_issue_id": null,
    "start_date": "2026-01-16",
    "due_date": "2026-01-31",
    "estimated_hours": 88,
    "done_ratio": 80,

    "custom_field_values": {
      "3": "1",
      "6": "2026-01-13",
      "8": "8.8",
      "9": "88",
      "10": "1",
      "12": "www.example88.com",
      "13": "Option 2",
      "15": "Test flow data redmine of long text",
      "16": "80",
      "17": "Test flow data redmine of text",
      "18": "",
      "20": "2"
    },

    "watcher_user_ids": []
  },

  "attachments": [
    {
      "filename": "Issue_Tracking_in_Redmine.html",
      "description": "Test flow data redmine for option description of files",
      "token": "15.fbe5d52e58f36913344e7a36cd1feca76789301862f7582927b3c0c1efb751b6"
    }
  ]
}

```

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

## 8. Request Completion
- HTTP Status: `200 OK`
- Page is fully rendered and returned to the client
- Database queries, view rendering, and garbage collection are completed

---


